import * as jwt from "jsonwebtoken";
import { Request, Response, NextFunction, response } from "express";
import { DateTimeService } from "../services/date.time.service";
import { UserModel } from "../models/user.model";
import { UserSignInModel } from "../models/user.signIn.model";
import { LoggedUserInformation } from "../models/logged.user.information";
import { BasicModule } from "./basic.module";
import { config } from "../consts/congif.const";
import { HttpCodes } from "../consts/http.code";
import * as fs from "fs";
import * as path from "path";
import { OAuth2Client, TokenPayload, LoginTicket, auth } from "google-auth-library";
import { UserService } from "../services/user.service";

export class AuthGuardModule extends BasicModule {
    /**
     *
     */
    constructor(public curretnRequest: Request, public currrentResponse: Response) {
        super(curretnRequest, currrentResponse);

    }

    privateKey: string = fs.readFileSync(path.join(__dirname, "../files/jwt.keys/private.key"), "utf8");
    publicKey: string = fs.readFileSync(path.join(__dirname, "../files/jwt.keys/public.key"), "utf8");


    /**
     * Generate New Access Token
     * @param userInfo Target User Infro 
     */
    generateAccessToken(userInfo: UserModel,  isLoginByGoogel: boolean = false): Promise<string> {
        return new Promise((resolve, reject) => {
            jwt.sign(this._getUserAccessTokeData(userInfo,  isLoginByGoogel), this.privateKey,
                {
                    algorithm: "RS256",
                    expiresIn:  '40 days' ,
                }, (error, accessToken) => {
                    if (error) {
                        reject(error);
                    } else {
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
    refrashAccessToken(userInfo: UserModel, loggedUserInfo: LoggedUserInformation, callBack: jwt.SignCallback): void {
        jwt.sign(this._getUserAccessTokeData(userInfo), this.privateKey, {
            algorithm: "RS256",
            //Set Dayes 
            expiresIn: DateTimeService.calculateNumberDays(new Date(loggedUserInfo.exp * 1000), 1) + " days"
        }, callBack);
    }

    /**
     * Verify And Decoded Access Token 
     * @param req Request
     * @param callBack Call Back Function For Passing Access Token Decoded Or Null
     */
    verifyAccessToken(callBack: CallableFunction) {

        try {
            let authorization = this.req.headers['authorization'];

            if (!authorization) {
                callBack(null, null);
            } else {
                let accessToken = authorization.split(' ')[1]
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
        } catch (error) {
            callBack(null, null);
        }
    }

    /**
     * Verify Googele Access Token 
     * @param accessToken 
     */
    verifyGoogeleAccessToken(accessToken: string): Promise<LoginTicket> {
        let auth = new OAuth2Client(config.googelOAuth2ClientClinetId, config.googelOAuth2ClientSecretId);
        return auth.
            verifyIdToken({
                idToken: accessToken,
                audience: config.googelOAuth2ClientClinetId,  // Specify the CLIENT_ID of the app that accesses the backend
                // Or, if multiple clients access the backend:
                //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
            });
    }


    /**
     * Chrck If User Logged .. And This Called Only With Apis Must Be Authrized
     */
    checkIfAuthrized(rreq: Request, rres: Response, next: NextFunction) {
        if (!this.res.locals) {
            //Send Status Unauthorized
            this.end_invalidAccessToken();
        }
        //Check If Passed Access Token 
        else if (!this.res.locals[config.loggedUerAccessToken]) {
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
    signIn(user: UserModel,  isLoginByGoogel: boolean = false) {
        //SignIn Now And Return SignIn Information
        this.generateAccessToken(user,  isLoginByGoogel)
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
    private _getUserAccessTokeData(userTarget: UserModel,  isLoginedByGoogel: boolean = false): LoggedUserInformation {
       
        return {
            _id: userTarget._id,
            userName: userTarget.userName,
            picturePath:UserService.getUserPicturePath(userTarget),
            languageCode: userTarget.languageCode,
            // isRememberMe: isRememberMe,//Save For Regenrate If Update Data Or Change Language
            isLoginedByGoogel: isLoginedByGoogel,
            postDefaultSettings: userTarget.postDefaultSettings,
            fullName:userTarget.fullName||userTarget.userName
        };
    }

}//End Class