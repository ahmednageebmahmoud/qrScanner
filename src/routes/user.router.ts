import {  Router } from 'express';
import { UserController } from '../controllers/user.controller';
import { AuthGuardService } from '../services/auth.guard.service';

const cont = new UserController(),
    r = Router();

/** User Sign-up : api/user/signUpByEmail */
r.post('/signUpByEmail', cont.signUpByEmail);

/** Send Secret Code To Emial For Create New Password: api/user/sendSecretCodeToEmailForResetPassword/:email */
r.post('/sendSecretCodeToEmailForResetPassword/:email', cont.sendSecretCodeToEmailForResetPassword);

/** Check From Reset Password Code For Enter New Password: api/user/validFroResetPasswordCode/:email/:code */
r.post('/validFroResetPasswordCode/:email/:code', cont.validFroResetPasswordCode);


/** Reset User Password And SignIn: api/user/resetPasswordAndSignIn/:email/:password */
r.post('/resetPasswordAndSignIn/:email/:password', cont.resetPasswordAndSignIn);


/** User Sign-in : api/user/signInByEmail */
r.post('/signInByEmail', cont.signInByEmail);

/** User sign-Up Or Sign-in By Gooogel API : api/user/signInByGoogel */
r.post('/signInByGoogel', cont.signInByGoogel);

/** User Update Account Information : api/user/update */
r.put('/update', AuthGuardService.checkIfAuthrized, cont.update);

/** Update User Language : api/user/updateLanguage */
r.put('/updateLanguage', AuthGuardService.checkIfAuthrized, cont.updateLanguage);





export {  r as userRouter }