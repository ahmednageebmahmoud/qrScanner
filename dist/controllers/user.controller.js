"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserController = void 0;
const user_module_1 = require("../modules/user.module");
class UserController {
    /**
     *  SignUp By Email
     * @param req
     * @param res
     */
    signUpByEmail(req, res) {
        new user_module_1.UserModule(req, res).signUp(req.body);
    }
    ;
    /**
     * Sign In By Email
     * @param req
     * @param res
     */
    signInByEmail(req, res) {
        new user_module_1.UserModule(req, res).signInByEmail(req.body);
    }
    ;
    /**
  * Sign Up Or Sign In By Googel
  * @param req
  * @param res
  */
    signInByGoogel(req, res) {
        new user_module_1.UserModule(req, res).signInByGoogel(req.body);
    }
    ;
    /**
     * Update Account Information
     * @param req
     * @param res
     */
    update(req, res) {
        new user_module_1.UserModule(req, res).update(req.body);
    }
    ;
    /**
 * Update User Language
 * @param req
 * @param res
 */
    updateLanguage(req, res) {
        new user_module_1.UserModule(req, res).updateLanguage(req.body);
    }
    ;
    /**
*  Send Secret Code To Emial For Create New Password
* @param req
* @param res
*/
    sendSecretCodeToEmailForResetPassword(req, res) {
        new user_module_1.UserModule(req, res).sendSecretCodeToEmailForResetPassword(req.params.email);
    }
    ;
    /**
     *  Check From Reset Password Code For Enter New Password
     * @param req
     * @param res
     */
    validFroResetPasswordCode(req, res) {
        new user_module_1.UserModule(req, res).validFroResetPasswordCode(req.params.email, +req.params.code);
    }
    ;
    /**
     *  Reset User Password And SignIn
     * @param req
     * @param res
     */
    resetPasswordAndSignIn(req, res) {
        new user_module_1.UserModule(req, res).resetPasswordAndSignIn(req.params.email, req.params.password);
    }
    ;
} //End Class
exports.UserController = UserController;
//# sourceMappingURL=user.controller.js.map