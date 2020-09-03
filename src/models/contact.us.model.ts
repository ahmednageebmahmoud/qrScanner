import { ContactUsTypeEnum } from "../enums/contact.us.type.enum";
import { ObjectId } from "mongodb";

export class ContactUsModel {
/**
 * يتم اضافة عنوان فقط فى حالة اذا كان نوع التواصل غير محدد
 */
    subject: string;
    /**
     * هذة الرسالة تحتوى على الربط فقط اذا كان يريد ان يبلغ على انتهاك فى السياسة
     */
    message: string;
    contatUsType: ContactUsTypeEnum;
    email:string;
    /**
     * يضاف معرف المستخدم اذا كان عامل تسجيل دخول
     */
    userCreatedId:ObjectId;
}