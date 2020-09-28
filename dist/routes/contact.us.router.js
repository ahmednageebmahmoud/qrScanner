"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.contactUsRouter = void 0;
const express_1 = require("express");
const contact_us_controller_1 = require("../controllers/contact.us.controller");
const cont = new contact_us_controller_1.ContactUsController(), r = express_1.Router();
exports.contactUsRouter = r;
/** Create New ContactUs : api/ContactUs/create   */
r.post('/create', cont.create);
//# sourceMappingURL=contact.us.router.js.map