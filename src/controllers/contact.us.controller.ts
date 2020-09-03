import { Request, Response } from "express";
import { ContactUsModel } from "../models/contact.us.model";
import { ContactUsModule } from "../modules/contact.us.module";

export class ContactUsController {

    /**
     *  Create New ContactUs 
     * @param req 
     * @param res 
     */
    create(req: Request, res: Response) {
        new ContactUsModule(req, res).create(<ContactUsModel>req.body);
    }



}//End Class