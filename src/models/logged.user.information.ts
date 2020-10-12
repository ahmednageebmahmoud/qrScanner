import { ObjectId } from "mongodb";

export class LoggedUserInformation {
    _id: ObjectId;
    userName: string;
    picturePath: string;
    languageCode: string;
    exp?:number;
    isLoginedByGoogel:boolean;
    fullName:string;
}