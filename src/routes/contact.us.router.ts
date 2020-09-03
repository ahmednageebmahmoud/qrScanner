import express, { Request, Response, Router } from 'express';
import { ContactUsController } from '../controllers/contact.us.controller';
import { AuthGuardService } from '../services/auth.guard.service';

const contactUsRouter = Router();
const cont = new ContactUsController();

/** Create New ContactUs : api/ContactUs/create   */
contactUsRouter.post('/create', cont.create);

//Export Now
export { contactUsRouter };