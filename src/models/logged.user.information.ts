import { ObjectId } from "mongodb";
import { PostDefaultSettingModel } from "./post.default.setting.model";

export class LoggedUserInformation {
    _id: ObjectId;
    userName: string;
    picturePath: string;
    languageCode: string;
    exp?:number;
    isLoginedByGoogel:boolean;
    postDefaultSettings:PostDefaultSettingModel;
    fullName:string;
}