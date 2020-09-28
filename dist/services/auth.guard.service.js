"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthGuardService = void 0;
const congif_const_1 = require("../consts/congif.const");
const http_code_1 = require("../consts/http.code");
const basic_module_1 = require("../modules/basic.module");
class AuthGuardService {
    /**
   * Chrck If User Logged .. And This Called Only With Apis Must Be Authrized
   */
    static checkIfAuthrized(req, res, next) {
        let bsM = new basic_module_1.BasicModule(req, res);
        if (!bsM.res.locals || !bsM.res.locals[congif_const_1.config.loggedUerInformation] || !bsM.res.locals[congif_const_1.config.loggedUerAccessToken]) {
            //Send Status Unauthorized
            bsM.end_failed(bsM.resource.invalidAccessToken, http_code_1.HttpCodes.forbidden);
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
} //End Class
exports.AuthGuardService = AuthGuardService;
//# sourceMappingURL=auth.guard.service.js.map