import { Request, Response } from "express";
import { BasicModule } from "./basic.module";
import { cols } from "../consts/collections.conse";
import { ObjectId } from "mongodb";
import { log } from "util";
import { config } from "../consts/congif.const";
import { ContactUsModel } from "../models/contact.us.model";

export class ContactUsModule extends BasicModule {
    /**
     * 
     * @param reqo Current Express Request
     * @param repos Current Express Reponse
     */
    constructor(private reqo: Request, private repos: Response) {
        super(reqo, repos);
    }



    /**
     * Create New ContactUs
     * @param sho 
     */
    create(c: ContactUsModel) {

        //Generate New ID
        let short: ContactUsModel = <ContactUsModel>{
            subject: c.subject,
            message: c.message,
            contatUsType: c.contatUsType,
            email: c.email,
            userCreatedId: this.loggedUser ? new ObjectId(this.loggedUser._id) : null
        };

        //Create New Document Now
        this.db.collection(cols.contactUs).insertOne(short).then(res => {
            if (!res.insertedId)
                return this.end_failed(this.resource.someErrorHasBeen);

            this.end_successfully(this.resource.contactUsSuccessfully, short);
        }).catch(this.catchError);
    }



}//End Class