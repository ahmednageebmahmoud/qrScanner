import { Request, Response } from "express";
import { UserModel } from "../models/user.model";
import { UserModule } from "../modules/user.module";

export class UserController {

    /**
     *  SignUp By Email
     * @param req 
     * @param res 
     */
    signUpByEmail(req: Request, res: Response) {
        new UserModule(req, res).signUp(req.body);
    };

    /**
     * Sign In By Email
     * @param req 
     * @param res 
     */
    signInByEmail(req: Request, res: Response) {
        new UserModule(req, res).signInByEmail(req.body);
    };

    /**
  * Sign Up Or Sign In By Googel
  * @param req 
  * @param res 
  */
    signInByGoogel(req: Request, res: Response) {
        new UserModule(req, res).signInByGoogel(req.body);
    };

    /**
     * Update Account Information
     * @param req 
     * @param res 
     */
    update(req: Request, res: Response) {
        new UserModule(req, res).update(req.body);
    };


    /**
 * Update User Language
 * @param req 
 * @param res 
 */
    updateLanguage(req: Request, res: Response) {
        new UserModule(req, res).updateLanguage(req.body);
    };


    /**
*  Send Secret Code To Emial For Create New Password
* @param req 
* @param res 
*/
    sendSecretCodeToEmailForResetPassword(req: Request, res: Response) {
        new UserModule(req, res).sendSecretCodeToEmailForResetPassword(req.params.email);
    };


    /**
     *  Check From Reset Password Code For Enter New Password
     * @param req 
     * @param res 
     */
    validFroResetPasswordCode(req: Request, res: Response) {
        new UserModule(req, res).validFroResetPasswordCode(req.params.email, +req.params.code);
    };


    /**
     *  Reset User Password And SignIn
     * @param req 
     * @param res 
     */
    resetPasswordAndSignIn(req: Request, res: Response) {
        new UserModule(req, res).resetPasswordAndSignIn(req.params.email, req.params.password);
    };
    

}//End Class