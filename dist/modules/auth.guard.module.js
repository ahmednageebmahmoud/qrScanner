"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthGuardModule = void 0;
const jwt = __importStar(require("jsonwebtoken"));
const date_time_service_1 = require("../services/date.time.service");
const basic_module_1 = require("./basic.module");
const congif_const_1 = require("../consts/congif.const");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const google_auth_library_1 = require("google-auth-library");
const user_service_1 = require("../services/user.service");
class AuthGuardModule extends basic_module_1.BasicModule {
    /**
     *
     */
    constructor(curretnRequest, currrentResponse) {
        super(curretnRequest, currrentResponse);
        this.curretnRequest = curretnRequest;
        this.currrentResponse = currrentResponse;
        this.privateKey = fs.readFileSync(path.join(__dirname, "../files/jwt.keys/private.key"), "utf8");
        this.publicKey = fs.readFileSync(path.join(__dirname, "../files/jwt.keys/public.key"), "utf8");
    }
    /**
     * Generate New Access Token
     * @param userInfo Target User Infro
     */
    generateAccessToken(userInfo, isLoginByGoogel = false) {
        return new Promise((resolve, reject) => {
            jwt.sign(this._getUserAccessTokeData(userInfo, isLoginByGoogel), this.privateKey, {
                algorithm: "RS256",
                expiresIn: '40 days',
            }, (error, accessToken) => {
                if (error) {
                    reject(error);
                }
                else {
                    resolve(accessToken);
                }
            });
        });
    }
    /**
     * Refrash Access Token Data And Expire Date
     * @param userInfo userTargett
     * @param loggedUserInfo Current User Information
     * @param callBack
     */
    refrashAccessToken(userInfo, loggedUserInfo, callBack) {
        jwt.sign(this._getUserAccessTokeData(userInfo), this.privateKey, {
            algorithm: "RS256",
            //Set Dayes 
            expiresIn: date_time_service_1.DateTimeService.calculateNumberDays(new Date(loggedUserInfo.exp * 1000), 1) + " days"
        }, callBack);
    }
    /**
     * Verify And Decoded Access Token
     * @param req Request
     * @param callBack Call Back Function For Passing Access Token Decoded Or Null
     */
    verifyAccessToken(callBack) {
        try {
            let authorization = this.req.headers['authorization'];
            if (!authorization) {
                callBack(null, null);
            }
            else {
                let accessToken = authorization.split(' ')[1];
                //verify Now
                jwt.verify(accessToken, this.publicKey, {
                    algorithms: ["RS256"]
                }, (error, accessTokenData) => {
                    if (error || !accessTokenData)
                        callBack(null, accessToken);
                    else
                        callBack(accessTokenData, accessToken);
                });
            }
        }
        catch (error) {
            callBack(null, null);
        }
    }
    /**
     * Verify Googele Access Token
     * @param accessToken
     */
    verifyGoogeleAccessToken(accessToken) {
        let auth = new google_auth_library_1.OAuth2Client(congif_const_1.config.googelOAuth2ClientClinetId, congif_const_1.config.googelOAuth2ClientSecretId);
        return auth.
            verifyIdToken({
            idToken: accessToken,
            audience: congif_const_1.config.googelOAuth2ClientClinetId,
        });
    }
    /**
     * Chrck If User Logged .. And This Called Only With Apis Must Be Authrized
     */
    checkIfAuthrized(rreq, rres, next) {
        if (!this.res.locals) {
            //Send Status Unauthorized
            this.end_invalidAccessToken();
        }
        //Check If Passed Access Token 
        else if (!this.res.locals[congif_const_1.config.loggedUerAccessToken]) {
            //Send Status Invalid accessToken
            this.end_invalidAccessToken();
        }
        else {
            next();
            // //Check If User Is Activve
            // (<MongoClient>res.locals[Defaults.db]).db().collection(DataBaseCollections.users)
            //     .findOne({ _id: new ObjectId(res.locals[Defaults.responseLocalLoggedUser].userId), isActive: true })
            //     .then((userInfo: any) => {
            //         if (userInfo == null)
            //             res.json(ResponseModel.userNotActive)
            //         else
            //             //Success Authrized
            //             next();
            //     });
        }
    }
    /**
     * Sign In
     * @param user
     * @param isRememberMe
     * @param isLoginByGoogel
     */
    signIn(user, isLoginByGoogel = false) {
        //SignIn Now And Return SignIn Information
        this.generateAccessToken(user, isLoginByGoogel)
            .then(accessToken => {
            this.end_successfully(this.resource.signInSuccessfully, accessToken);
        }).catch(error => {
            return this.end_failed(this.resource.iCouldNotSignYouIn);
        });
    }
    /**
     * Get Access Token Date For Generate New AccessToken
     * @param userTarget
     * @param isRememberMe
     */
    _getUserAccessTokeData(userTarget, isLoginedByGoogel = false) {
        return {
            _id: userTarget._id,
            userName: userTarget.userName,
            picturePath: user_service_1.UserService.getUserPicturePath(userTarget),
            languageCode: userTarget.languageCode,
            // isRememberMe: isRememberMe,//Save For Regenrate If Update Data Or Change Language
            isLoginedByGoogel: isLoginedByGoogel,
            postDefaultSettings: userTarget.postDefaultSettings,
            fullName: userTarget.fullName || userTarget.userName
        };
    }
} //End Class
exports.AuthGuardModule = AuthGuardModule;
//# sourceMappingURL=auth.guard.module.js.map