import {  Router } from 'express';
import { ContactUsController } from '../controllers/contact.us.controller';

const cont = new ContactUsController(),
    r = Router();

/** Create New ContactUs : api/ContactUs/create   */
r.post('/create', cont.create);

export { r as contactUsRouter }