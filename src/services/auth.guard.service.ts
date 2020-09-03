import { Request, Response, NextFunction, response } from "express";
import { config } from "../consts/congif.const";
import { HttpCodes } from "../consts/http.code";

import { OAuth2Client, TokenPayload } from "google-auth-library";
import { BasicModule } from "../modules/basic.module";

export class AuthGuardService {

    /**
   * Chrck If User Logged .. And This Called Only With Apis Must Be Authrized
   */
    static checkIfAuthrized(req: Request, res: Response, next: NextFunction) {
        let bsM = new BasicModule(req, res);
        if (!bsM.res.locals||!bsM.res.locals[config.loggedUerInformation]||!bsM.res.locals[config.loggedUerAccessToken]) {
            //Send Status Unauthorized
            bsM.end_failed(bsM.resource.invalidAccessToken, HttpCodes.forbidden);
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



}//End Class