"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContactUsModule = void 0;
const basic_module_1 = require("./basic.module");
const collections_conse_1 = require("../consts/collections.conse");
const mongodb_1 = require("mongodb");
class ContactUsModule extends basic_module_1.BasicModule {
    /**
     *
     * @param reqo Current Express Request
     * @param repos Current Express Reponse
     */
    constructor(reqo, repos) {
        super(reqo, repos);
        this.reqo = reqo;
        this.repos = repos;
    }
    /**
     * Create New ContactUs
     * @param sho
     */
    create(c) {
        //Generate New ID
        let short = {
            subject: c.subject,
            message: c.message,
            contatUsType: c.contatUsType,
            email: c.email,
            userCreatedId: this.loggedUser ? new mongodb_1.ObjectId(this.loggedUser._id) : null
        };
        //Create New Document Now
        this.db.collection(collections_conse_1.cols.contactUs).insertOne(short).then(res => {
            if (!res.insertedId)
                return this.end_failed(this.resource.someErrorHasBeen);
            this.end_successfully(this.resource.contactUsSuccessfully, short);
        }).catch(this.catchError);
    }
} //End Class
exports.ContactUsModule = ContactUsModule;
//# sourceMappingURL=contact.us.module.js.map