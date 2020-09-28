"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContactUsController = void 0;
const contact_us_module_1 = require("../modules/contact.us.module");
class ContactUsController {
    /**
     *  Create New ContactUs
     * @param req
     * @param res
     */
    create(req, res) {
        new contact_us_module_1.ContactUsModule(req, res).create(req.body);
    }
} //End Class
exports.ContactUsController = ContactUsController;
//# sourceMappingURL=contact.us.controller.js.map