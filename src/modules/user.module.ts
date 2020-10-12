import { UserModel } from "../models/user.model";
import { Request, Response } from "express";
import { BasicModule } from "./basic.module";
import { cols } from "../consts/collections.conse";
import { StringHashingService } from "../services/string.hashing.service";
import { AuthGuardModule } from "./auth.guard.module";
import { UserSignInModel } from "../models/user.signIn.model";
import { TokenPayload, LoginTicket } from "google-auth-library";
import { FileService } from "../services/file.services";
import { FindOneOptions, ObjectId } from "mongodb";
import { SocketIOService } from "../services/socket.io.service";
import { ISocketResponse } from "../interfaces/i.socket.response";
import { EmailService } from "../services/email.service";
import { UserService } from "../services/user.service";
import * as formidable from "formidable";
import { Hash } from "crypto";
import { promises } from "fs";
import { pathToFileURL } from "url";
import * as path from "path";
import { log } from "console";

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
    update() {

        let form = new formidable.IncomingForm();
        let userInfo: UserModel;
        form.parse(this.req, (formParseError, fields, files) => {
            //Return Error I Icant Saved Picture
            if (formParseError)
                return this.end_failed(this.resource.iCouldNotSaveNewPicture);

            //Parse Json To Object Now
            userInfo = fields as unknown as UserModel;
            this.updateNow(userInfo, files?.image?.path, files?.image?.name);
        });
    }

    /**
     * Update User Now In DataBase
     * @param userInfo 
     * @param newPictureTepmPath 
     */
    updateNow(userInfo: UserModel, newPictureTepmPath: string | null, newPictureName: string | null): void {
        this.db.collection(cols.users).findOne<UserModel>({ _id: new ObjectId(this.loggedUser._id) }).then(async user => {
            //Check If User Is Not Found
            if (!user) {
                //Remove Temp Picture Id Exsist
                FileService.removeFiles(newPictureTepmPath);
                return this.end_failed(this.resource.accountIsNotFound);
            }

            //Check If User Want Change, Must Be The Email Is Avalibale
            if ((userInfo.email != user.email) && await this.db.collection(cols.users).countDocuments({ email: userInfo.email }) > 0)
                return this.end_failed(this.resource.emailBeforeUsed);

            let userUpdate: UserModel = {} as UserModel;

            //Check If User Want Change Password 
            if (userInfo.newPassword) {
                //If User Alredy Has Password, Must Be Check If Old Password Mmatched With Current Password Passd From User
                if (user.password && !StringHashingService.verify(userInfo.password, user.password)) {
                    //Remove Temp Picture Id Exsist
                    FileService.removeFiles(newPictureTepmPath);
                    return this.end_failed(this.resource.currentPasswordIsNotCorrect);
                }

                //Every Things Good Now Must be Hash New Password And Assign To Password Field To Save 
                userUpdate.password = StringHashingService.hash(userInfo.newPassword);
            }

            //Check If User Want Change Profile Picture
            if (newPictureTepmPath) {
                userUpdate.picturePath = `/files/users/${user.userName}_${newPictureName.replace(/ /gm, '')}`
                userUpdate.isGoogelPicture = false;
            }

            userUpdate._id = user._id;
            userUpdate.fullName = userInfo.fullName;
            userUpdate.email = userInfo.email;
            userUpdate.paypalEmail = userInfo.paypalEmail;
            userUpdate.phoneNumber = userInfo.phoneNumber;
            userUpdate.countryId = userInfo.countryId;
            userUpdate.languageCode = userInfo.languageCode;



            //Save New Data Now 
            this.db.collection(cols.users).updateOne({ _id: new ObjectId(this.loggedUser._id) }, {
                $set: userUpdate
            }).then(res => {
                //Remove Old Picture If Add New And Also Is Not Googel Picture Path And Rename The New Picture
                if (newPictureTepmPath && !user.isGoogelPicture) {
                    FileService.removeFiles(path.join(__dirname, '..', user.picturePath));
                    FileService.rename(newPictureTepmPath, path.join(__dirname, '..', userUpdate.picturePath));
                }

                userUpdate.userName = user.userName;
                userUpdate.isHasPassword =( userUpdate.password||user.password) ? true : false;
                userUpdate.password = null;
                userUpdate.picturePath = UserService.getUserPicturePath(newPictureTepmPath ? userUpdate : user);

                //Pass The New Information To Front End Now
                SocketIOService.sendNewUserInformation(this.loggedUser._id, {
                    newUserInformation: userUpdate
                } as ISocketResponse);
                return this.end_successfully(this.resource.updated, userUpdate);
            }).catch(err => {
                //Remove Temp Picture Id Exsist
                FileService.removeFiles(newPictureTepmPath);
                this.catchError2(err, this)
            });
        }).catch(err => {
            //Remove Temp Picture Id Exsist
            FileService.removeFiles(newPictureTepmPath);
            this.catchError2(err, this)
        });
    }

    /**Log out From All Pages  */
logOutFromAllPages():void{
    //Only Tell All Pages To Log Outh
       SocketIOService.userLoggedOut(this.loggedUser._id);
    this.end_successfully();
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


                //Pass This New  Laugage Id For Update In All Pages 
                SocketIOService.sendUserChangeLanugage(this.loggedUser._id, <ISocketResponse>{
                    languageCode: userInfo.languageCode,
                });
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

        userCreating.userName = userCreating.userName;

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
                        return new AuthGuardModule(this.req, this.res).signIn(user, true);

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
                        new AuthGuardModule(this.req, this.res).signIn(newUser, true);

                    }).catch(this.catchError);
                }).catch(this.catchError);

            }).catch(err => this.catchError2(err, this));
    }

    /**
     * Send Secret Code To Emial For Create New Password
     * @param email 
     */
    sendSecretCodeToEmailForResetPassword(email: string) {

        let newCode: string = Math.ceil(Math.random() * 9999).toString();
        let code: number = Number(newCode + "0".repeat(Math.abs(newCode.length - 4)));
        this.db.collection(cols.users).updateOne({ email }, {
            $set: {
                resetPasswordCode: code
            }
        }).then(res => {
            //Check From Account Is Not Found
            if (!res.modifiedCount)
                return this.end_failed(this.resource.accountIsNotFound);

            this.db.collection(cols.users).findOne<UserModel>({ email })
                .then(user => {

                    //Send Code To Email Now
                    if (EmailService.sendSecretCodeToEmailForResetPassword(user.email, code, user.languageCode))
                        return this.end_successfully(this.resource.codeSentSuccessfully);
                    else
                        return this.end_failed(this.resource.iCanNotSendCodeToYoureEmail);

                }).catch(this.catchError);
        }).catch(this.catchError);
    }


    /**
     *  Check From Reset Password Code For Enter New Password
     */
    validFroResetPasswordCode(email: string, code: number) {
        this.db.collection(cols.users).findOne<UserModel>({ email: email, resetPasswordCode: code }).then(res => {
            //Check If Invlaid Code
            if (!res)
                return this.end_failed(this.resource.codeIsInvalid);

            return this.end_successfully(this.resource.codeIsValid);
        }).catch(this.catchError);
    }


    /**
     * Reset User Password And SignIn
     * @param email 
     * @param password 
     */
    resetPasswordAndSignIn(email: string, password: string): void {
        this.db.collection(cols.users).updateOne({ email: email }, {
            $set: { password: StringHashingService.hash(password) }
        }).then(res => {
            //Check If Invlaid Code
            if (!res.modifiedCount)
                return this.end_failed(this.resource.accountIsNotFound);

            //Return SignIn Now
            return this.signInByEmail(<UserSignInModel>{
                email: email,
                password: password
            });
        }).catch(this.catchError);
    }

    /**
     * Get Current User Information For Update 
     */
    getCurrentUserInformationForUpdate(): void {
        this.db.collection(cols.users).findOne<UserModel>({ _id: new ObjectId(this.loggedUser._id) }, {
            projection: {
                fullName: true,
                userName: true,
                email: true,
                paypalEmail: true,
                phoneNumber: true,
                countryId: true,
                password: true,
                picturePath: true,
                isGoogelPicture: true,
                languageCode: true
            }
        })
            .then(user => {
                if (!user)
                    return this.end_failed(this.resource.userInformationIsNotDefiend);
                user.isHasPassword = user.password ? true : false;
                user.password = null;
                user.picturePath = UserService.getUserPicturePath(user);

                return this.end_successfully(this.resource.successfully, user);
            }).catch(this.catchError);

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