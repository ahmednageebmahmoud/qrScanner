"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContactUsTypeEnum = void 0;
var ContactUsTypeEnum;
(function (ContactUsTypeEnum) {
    /**
     * مشكلة فى تسجيل الدخول
     */
    ContactUsTypeEnum[ContactUsTypeEnum["problemInSignIn"] = 1] = "problemInSignIn";
    /**
     * مشكلة فى انشاء حساب جديد
     */
    ContactUsTypeEnum[ContactUsTypeEnum["problemInSignUp"] = 2] = "problemInSignUp";
    /**
     * مشكلة فى انشاء اختصار جديد
     */
    ContactUsTypeEnum[ContactUsTypeEnum["problemInCreateNewShoretener"] = 3] = "problemInCreateNewShoretener";
    /**
     * لقد تم العثور على رابط مختصر ينتهك سياسة الاستخدام
     */
    ContactUsTypeEnum[ContactUsTypeEnum["findShortLinkThatViolatesThwUsagePolicy"] = 4] = "findShortLinkThatViolatesThwUsagePolicy";
    ContactUsTypeEnum[ContactUsTypeEnum["other"] = 5] = "other";
})(ContactUsTypeEnum = exports.ContactUsTypeEnum || (exports.ContactUsTypeEnum = {}));
//# sourceMappingURL=contact.us.type.enum.js.map