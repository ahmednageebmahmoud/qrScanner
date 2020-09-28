"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserModule = void 0;
const basic_module_1 = require("./basic.module");
const collections_conse_1 = require("../consts/collections.conse");
const string_hashing_service_1 = require("../services/string.hashing.service");
const auth_guard_module_1 = require("./auth.guard.module");
const file_services_1 = require("../services/file.services");
const mongodb_1 = require("mongodb");
const socket_io_service_1 = require("../services/socket.io.service");
const email_service_1 = require("../services/email.service");
class UserModule extends basic_module_1.BasicModule {
    /**
       *
       * @param reqo Current Express Request
       * @param repos Current Express Reponse
       */
    constructor(reqo, repos) {
        super(reqo, repos);
        this.reqo = reqo;
        this.repos = repos;
    }
    /**
     * Update Account Information
     * @param userInfo
     */
    update(userInfo) {
        return __awaiter(this, void 0, void 0, function* () {
            let newPicturePath;
            yield this.db.collection(collections_conse_1.cols.users).findOne({ _id: new mongodb_1.ObjectId(this.loggedUser._id) }).then((res) => __awaiter(this, void 0, void 0, function* () {
                //Check If Account Is Not Found
                if (!res)
                    return this.end_unauthorized(this.resource.accountIsNotFound);
                //Check If Email Is A valible
                if ((userInfo.email != res.email) && (yield this.db.collection(collections_conse_1.cols.users).countDocuments({ email: userInfo.email })) > 0)
                    return this.end_failed(this.resource.emailBeforeUsed);
                //Save Picture If Passed New
                if (userInfo.newPicture) {
                    newPicturePath = file_services_1.FileService.saveFileSync(userInfo.newPicture, "user");
                    if (!newPicturePath)
                        return this.end_failed(this.resource.iCouldNotSaveNewPicture);
                }
                //Update Now
                this.db.collection(collections_conse_1.cols.users).updateOne({ _id: new mongodb_1.ObjectId(this.loggedUser._id) }, {
                    $set: {
                        email: userInfo.email,
                        fullName: userInfo.fullName,
                        languageCode: userInfo.languageCode,
                        //نضع مسار الصوة الجديدة اذا فقط تم تغيرها
                        picturePath: userInfo.newPicture || res.picturePath,
                        //اذا كان تم تغير الصورة فـ اذا الصورة لم تعد من جوجل
                        isGoogelPicture: userInfo.newPicture ? false : res.isGoogelPicture,
                        //اذا تم تغير الاميل فـ اذا الاكونت لم يعد مرتبط بـ جوجب
                        googelId: (userInfo.email != res.email) ? null : res.googelId,
                        password: userInfo.password ? string_hashing_service_1.StringHashingService.hash(userInfo.password) : res.password,
                    }
                }).then(up => {
                    if (up.modifiedCount == 0)
                        return this.end_info(this.resource.thereAreNoNewModifications);
                    //Delete Old Picture From Server
                    file_services_1.FileService.removeFiles(res.picturePath);
                    this.end_successfully(this.resource.updated);
                }).catch(err => this.catchError2(err, this));
            })).catch(err => this.catchError2(err, this));
        });
    }
    /**
         * Update Account Information
         * @param userInfo
         */
    updateLanguage(userInfo) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.db.collection(collections_conse_1.cols.users).findOne({ _id: new mongodb_1.ObjectId(this.loggedUser._id) }).then((res) => __awaiter(this, void 0, void 0, function* () {
                //Check If Account Is Not Found
                if (!res)
                    return this.end_unauthorized(this.resource.accountIsNotFound);
                //Update Now
                this.db.collection(collections_conse_1.cols.users).updateOne({ _id: new mongodb_1.ObjectId(this.loggedUser._id) }, {
                    $set: {
                        languageCode: userInfo.languageCode,
                    }
                }).then(up => {
                    if (up.modifiedCount == 0)
                        return this.end_info(this.resource.thereAreNoNewModifications);
                    //Update Resources For Reponse   
                    this.fillCurrentResources(userInfo.languageCode);
                    //Pass This New  Laugage Id For Update In All Pages 
                    socket_io_service_1.SocketIOService.sendUserChangeLanugage(this.loggedUser._id, {
                        languageCode: userInfo.languageCode,
                    });
                    this.end_successfully(this.resource.updated);
                }).catch(err => this.catchError2(err, this));
            })).catch(err => this.catchError2(err, this));
        });
    }
    /**
     * SignUp By Email
     * @param userCreating
     */
    signUp(userCreating) {
        return __awaiter(this, void 0, void 0, function* () {
            //Check From Data
            if (!userCreating.userName || !userCreating.email || !userCreating.password)
                return this.end_failed(this.resource.pleaseEnterUserNameAndEmailAndPassword);
            userCreating.userName = userCreating.userName;
            //Check From User Name Is Dublicated
            if ((yield this.userNameUsedCount(userCreating.userName)) > 0)
                return this.end_failed(this.resource.userNameBeforeUsed);
            //Check From Email Is Dublicated
            if ((yield this.db.collection(collections_conse_1.cols.users).countDocuments({ email: { $regex: userCreating.email, $options: 'si' } })) > 0)
                return this.end_failed(this.resource.emailBeforeUsed);
            let user = {
                userName: userCreating.userName,
                email: userCreating.email,
                password: string_hashing_service_1.StringHashingService.hash(userCreating.password),
                languageCode: userCreating.languageCode
            };
            //Insert New User Now
            this.db.collection(collections_conse_1.cols.users).insertOne(user).then(res => {
                //Check If Inserted
                if (!user._id)
                    return this.end_failed(this.resource.iCanNotRegisterNewAccount);
                //SignIn Now And Return SignIn Information
                new auth_guard_module_1.AuthGuardModule(this.req, this.res).signIn(user, true);
            }).catch(this.catchError);
        });
    }
    /**
     * Sign In By Email
     * @param userSignIn
     */
    signInByEmail(userSignIn) {
        //Find User
        this.db.collection(collections_conse_1.cols.users).findOne({ email: userSignIn.email }).then(res => {
            //Check If Not Found And Check From Password
            if (!res || !string_hashing_service_1.StringHashingService.verify(userSignIn.password, res.password))
                return this.end_failed(this.resource.invalidUserNameOrPassword);
            //SignIn Now And Return SignIn Information
            return new auth_guard_module_1.AuthGuardModule(this.req, this.res).signIn(res);
        }).catch(this.catchError);
    }
    /**
     * Sign Up Or Sign In By Googel
     * @param userSignIn
     */
    signInByGoogel(userSignIn) {
        /**
         * اذا كان الاميل موجود مسبقا نقوم بـ ارجاع الاكسس توكن الخاص بنا لتتم عملية تسجيل الدخول الافتراضية
         *  مع تحديد ان هذة عملية تسجبل دخول تمت بواسطة جوجل بحيث نعمل تسجيل خلوج تلقائى اذا المستخدم عمل تسجيل خروج من جوجل
         *
         * اما اذا لم يكن الاميل موجود اذا سوف نقوم بـ انشاء حساب جديد ونقوم بعمل عميلة تسجيل دخول مثل ما تكلمنا عنها فى التليق السابق
         *
         */
        //Decode Googel Acess Token By Googel API
        new auth_guard_module_1.AuthGuardModule(this.req, this.res)
            .verifyGoogeleAccessToken(userSignIn.googelAccessToken)
            .then((tiket) => {
            let tok = tiket.getPayload();
            //Check Is User Already Created Account
            this.db.collection(collections_conse_1.cols.users).findOne({ email: tok.email }).then((user) => __awaiter(this, void 0, void 0, function* () {
                //Check For SignIn And Return SignIn Information
                if (user)
                    return new auth_guard_module_1.AuthGuardModule(this.req, this.res).signIn(user, true);
                //Now Create New Account And Sign In 
                let userName = tok.email.split('@')[0].replace(/[$]|[@]|[/]|[%]|[\^]|[&]|[\*]/gm, '_');
                //Get Users Count For Generate New User Namw Unique
                let userscount = yield this.db.collection(collections_conse_1.cols.users).countDocuments();
                let newUser = {
                    userName: yield this.generateUniqueUserName(userName, userName, userscount, 0),
                    email: tok.email,
                    picturePath: tok.picture,
                    fullName: tok.name,
                    googelId: tok.sub,
                    isGoogelPicture: true
                };
                //Create New Document Now
                this.db.collection(collections_conse_1.cols.users).insertOne(newUser).then(res => {
                    //Check If Inserted
                    if (!newUser._id)
                        return this.end_failed(this.resource.iCanNotRegisterNewAccount);
                    //SignIn Now And Return SignIn Information
                    new auth_guard_module_1.AuthGuardModule(this.req, this.res).signIn(newUser, true);
                }).catch(this.catchError);
            })).catch(this.catchError);
        }).catch(err => this.catchError2(err, this));
    }
    /**
     * Send Secret Code To Emial For Create New Password
     * @param email
     */
    sendSecretCodeToEmailForResetPassword(email) {
        let newCode = Math.ceil(Math.random() * 9999).toString();
        let code = Number(newCode + "0".repeat(Math.abs(newCode.length - 4)));
        this.db.collection(collections_conse_1.cols.users).updateOne({ email }, {
            $set: {
                resetPasswordCode: code
            }
        }).then(res => {
            //Check From Account Is Not Found
            if (!res.modifiedCount)
                return this.end_failed(this.resource.accountIsNotFound);
            this.db.collection(collections_conse_1.cols.users).findOne({ email })
                .then(user => {
                //Send Code To Email Now
                if (email_service_1.EmailService.sendSecretCodeToEmailForResetPassword(user.email, code, user.languageCode))
                    return this.end_successfully(this.resource.codeSentSuccessfully);
                else
                    return this.end_failed(this.resource.iCanNotSendCodeToYoureEmail);
            }).catch(this.catchError);
        }).catch(this.catchError);
    }
    /**
     *  Check From Reset Password Code For Enter New Password
     */
    validFroResetPasswordCode(email, code) {
        this.db.collection(collections_conse_1.cols.users).findOne({ email: email, resetPasswordCode: code }).then(res => {
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
    resetPasswordAndSignIn(email, password) {
        this.db.collection(collections_conse_1.cols.users).updateOne({ email: email }, {
            $set: { password: string_hashing_service_1.StringHashingService.hash(password) }
        }).then(res => {
            //Check If Invlaid Code
            if (!res.modifiedCount)
                return this.end_failed(this.resource.accountIsNotFound);
            //Return SignIn Now
            return this.signInByEmail({
                email: email,
                password: password
            });
        }).catch(this.catchError);
    }
    /**
     * Generate New User Name
     * @param userName User Name Affter Updating
     * @param orignalUserName Orignal User Name
     * @param usersCount Current User Count In DB
     * @param callCounter Caounter Call This Function
     */
    generateUniqueUserName(userName, orignalUserName, usersCount, callCounter) {
        return __awaiter(this, void 0, void 0, function* () {
            //Get All User Name Start With New User Name
            if ((yield this.userNameUsedCount(userName)) == 0)
                return userName;
            return this.generateUniqueUserName(orignalUserName + (usersCount + callCounter), orignalUserName, usersCount, callCounter + 1);
        });
    }
    /**
     * Get User Name Used Count
     * @param userName
     */
    userNameUsedCount(userName) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.collection(collections_conse_1.cols.users).countDocuments({ userName: { $regex: userName, $options: 'si' } });
        });
    }
} //End Class
exports.UserModule = UserModule;
//# sourceMappingURL=user.module.js.map