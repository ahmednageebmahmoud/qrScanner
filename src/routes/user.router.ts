import express, { Request, Response, Router } from 'express';
import { UserController } from '../controllers/user.controller';
import { AuthGuardService } from '../services/auth.guard.service';

const userRouter = Router();
const cont=new UserController();

/** User Sign-up : api/user/signUpByEmail */
userRouter.post('/signUpByEmail', cont.signUpByEmail);

/** User Sign-in : api/user/signInByEmail */
userRouter.post('/signInByEmail', cont.signInByEmail);

/** User sign-Up Or Sign-in By Gooogel API : api/user/signInByGoogel */
userRouter.post('/signInByGoogel', cont.signInByGoogel);

/** User Update Account Information : api/user/update */
userRouter.put('/update',AuthGuardService.checkIfAuthrized ,cont.update);

/** Update User Language : api/user/updateLanguage */
userRouter.put('/updateLanguage',AuthGuardService.checkIfAuthrized ,cont.updateLanguage);



 


//Export Now
export { userRouter};