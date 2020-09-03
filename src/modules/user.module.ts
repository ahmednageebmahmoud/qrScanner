import { UserModel } from "../models/user.model";
import { Request, Response } from "express";
import { BasicModule } from "./basic.module";
import { cols } from "../consts/collections.conse";
import { StringHashingService } from "../services/string.hashing.service";
import { AuthGuardModule } from "./auth.guard.module";
import { UserSignInModel } from "../models/user.signIn.model";
import { TokenPayload, LoginTicket } from "google-auth-library";
import { FileService } from "../services/file.services";
import { urlencoded } from "body-parser";
import { ObjectId } from "mongodb";
import { StringDecoder } from "string_decoder";
import { cpus } from "os";
import { threadId } from "worker_threads";
import { isRegExp } from "util";
import { FileSaveingModel } from "../models/file.saveing.model";

export class UserModule extends BasicModule {

    /**
       * 
       * @param reqo Current Express Request
       * @param repos Current Express Reponse
       */
    constructor(private reqo: Request, private repos: Response) {
        super(reqo, repos);
    }

    /**
     * Update Account Information
     * @param userInfo 
     */
    async update(userInfo: UserModel) {
        let newPicturePath: string;
        await this.db.collection(cols.users).findOne<UserModel>({ _id: new ObjectId(this.loggedUser._id) }).then(async res => {
            //Check If Account Is Not Found
            if (!res) return this.end_unauthorized(this.resource.accountIsNotFound);

            //Check If Email Is A valible
            if ((userInfo.email != res.email) && await this.db.collection(cols.users).countDocuments({ email: userInfo.email }) > 0)
                return this.end_failed(this.resource.emailBeforeUsed);

            //Save Picture If Passed New
            if (userInfo.newPicture) {
                newPicturePath = FileService.saveFileSync(userInfo.newPicture, "user");
                if (!newPicturePath)
                    return this.end_failed(this.resource.iCouldNotSaveNewPicture);
            }


            //Update Now
            this.db.collection(cols.users).updateOne({ _id: new ObjectId(this.loggedUser._id) }, {
                $set:
                    <UserModel>{
                        email: userInfo.email,
                        fullName: userInfo.fullName,
                        languageCode: userInfo.languageCode,
                        //نضع مسار الصوة الجديدة اذا فقط تم تغيرها
                        picturePath: userInfo.newPicture || res.picturePath,
                        //اذا كان تم تغير الصورة فـ اذا الصورة لم تعد من جوجل
                        isGoogelPicture: userInfo.newPicture ? false : res.isGoogelPicture,
                        //اذا تم تغير الاميل فـ اذا الاكونت لم يعد مرتبط بـ جوجب
                        googelId: (userInfo.email != res.email) ? null : res.googelId,
                        password: userInfo.password ? StringHashingService.hash(userInfo.password) : res.password,
                    }
            }).then(up => {

                if (up.modifiedCount == 0) return this.end_info(this.resource.thereAreNoNewModifications);


                //Delete Old Picture From Server
                FileService.removeFiles(res.picturePath);

                this.end_successfully(this.resource.updated);
            }).catch(err => this.catchError2(err, this));

        }).catch(err => this.catchError2(err, this));





    }


    /**
         * Update Account Information
         * @param userInfo 
         */
    async updateLanguage(userInfo: UserModel) {
        await this.db.collection(cols.users).findOne<UserModel>({ _id: new ObjectId(this.loggedUser._id) }).then(async res => {
            //Check If Account Is Not Found
            if (!res) return this.end_unauthorized(this.resource.accountIsNotFound);

            //Update Now
            this.db.collection(cols.users).updateOne({ _id: new ObjectId(this.loggedUser._id) }, {
                $set:
                    <UserModel>{
                        languageCode: userInfo.languageCode,
                    }
            }).then(up => {

                if (up.modifiedCount == 0) return this.end_info(this.resource.thereAreNoNewModifications);
               //Update Resources For Reponse   
                this.fillCurrentResources(userInfo.languageCode);

                

                this.end_successfully(this.resource.updated);
            }).catch(err => this.catchError2(err, this));
        }).catch(err => this.catchError2(err, this));
    }



    /**
     * SignUp By Email
     * @param userCreating 
     */
    async signUp(userCreating: UserModel): Promise<void> {

        //Check From Data
        if (!userCreating.userName || !userCreating.email || !userCreating.password)
            return this.end_failed(this.resource.pleaseEnterUserNameAndEmailAndPassword);

        userCreating.userName = userCreating.userName.replace(/[$]|[@]|[/]|[%]|[\^]|[&]|[\*]/gm, '_');

        //Check From User Name Is Dublicated
        if (await this.userNameUsedCount(userCreating.userName) > 0)
            return this.end_failed(this.resource.userNameBeforeUsed);

        //Check From Email Is Dublicated
        if (await this.db.collection(cols.users).countDocuments({ email: { $regex: userCreating.email, $options: 'si' } }) > 0)
            return this.end_failed(this.resource.emailBeforeUsed);


        let user: UserModel = <UserModel>{
            userName: userCreating.userName,
            email: userCreating.email,
            password: StringHashingService.hash(userCreating.password),
            languageCode: userCreating.languageCode
        };
        //Insert New User Now
        this.db.collection(cols.users).insertOne(user).then(res => {
            //Check If Inserted
            if (!user._id)
                return this.end_failed(this.resource.iCanNotRegisterNewAccount);

            //SignIn Now And Return SignIn Information
            new AuthGuardModule(this.req, this.res).signIn(user, true);
        }).catch(this.catchError);
    }

    /**
     * Sign In By Email
     * @param userSignIn 
     */
    signInByEmail(userSignIn: UserSignInModel) {
        //Find User
        this.db.collection(cols.users).findOne<UserModel>({ email: userSignIn.email }).then(res => {
            //Check If Not Found And Check From Password
            if (!res || !StringHashingService.verify(userSignIn.password, res.password))
                return this.end_failed(this.resource.invalidUserNameOrPassword);

            //SignIn Now And Return SignIn Information
            return new AuthGuardModule(this.req, this.res).signIn(res);
        }).catch(this.catchError);
    }


    /**
     * Sign Up Or Sign In By Googel
     * @param userSignIn 
     */
    signInByGoogel(userSignIn: UserSignInModel) {
        /**
         * اذا كان الاميل موجود مسبقا نقوم بـ ارجاع الاكسس توكن الخاص بنا لتتم عملية تسجيل الدخول الافتراضية
         *  مع تحديد ان هذة عملية تسجبل دخول تمت بواسطة جوجل بحيث نعمل تسجيل خلوج تلقائى اذا المستخدم عمل تسجيل خروج من جوجل 
         * 
         * اما اذا لم يكن الاميل موجود اذا سوف نقوم بـ انشاء حساب جديد ونقوم بعمل عميلة تسجيل دخول مثل ما تكلمنا عنها فى التليق السابق
         * 
         */

        //Decode Googel Acess Token By Googel API
        new AuthGuardModule(this.req, this.res)
            .verifyGoogeleAccessToken(userSignIn.googelAccessToken)
            .then((tiket: LoginTicket) => {

                let tok = tiket.getPayload();

                //Check Is User Already Created Account
                this.db.collection(cols.users).findOne<UserModel>({ email: tok.email }).then(async user => {

                    //Check For SignIn And Return SignIn Information
                    if (user)
                        return new AuthGuardModule(this.req, this.res).signIn(user,  true);

                    //Now Create New Account And Sign In 

                    let userName = tok.email.split('@')[0].replace(/[$]|[@]|[/]|[%]|[\^]|[&]|[\*]/gm, '_');
                    //Get Users Count For Generate New User Namw Unique
                    let userscount = await this.db.collection(cols.users).countDocuments();

                    let newUser: UserModel = <UserModel>{
                        userName: await this.generateUniqueUserName(userName, userName, userscount, 0),
                        email: tok.email,
                        picturePath: tok.picture,
                        fullName: tok.name,
                        googelId: tok.sub,
                        isGoogelPicture: true
                    };

                    //Create New Document Now
                    this.db.collection(cols.users).insertOne(newUser).then(res => {
                        //Check If Inserted
                        if (!newUser._id)
                            return this.end_failed(this.resource.iCanNotRegisterNewAccount);

                        //SignIn Now And Return SignIn Information
                        new AuthGuardModule(this.req, this.res).signIn(newUser,  true);

                    }).catch(this.catchError);
                }).catch(this.catchError);

            }).catch(err => this.catchError2(err, this));
    }


    /**
     * Generate New User Name
     * @param userName User Name Affter Updating
     * @param orignalUserName Orignal User Name
     * @param usersCount Current User Count In DB
     * @param callCounter Caounter Call This Function
     */
    async generateUniqueUserName(userName: string, orignalUserName: string, usersCount: number, callCounter: number): Promise<string> {
        //Get All User Name Start With New User Name
        if (await this.userNameUsedCount(userName) == 0) return userName;
        return this.generateUniqueUserName(orignalUserName + (usersCount + callCounter), orignalUserName, usersCount, callCounter + 1);
    }

    /**
     * Get User Name Used Count
     * @param userName 
     */
    async userNameUsedCount(userName: string): Promise<number> {
        return await this.db.collection(cols.users).countDocuments({ userName: { $regex: userName, $options: 'si' } });
    }




}//End Class