import { ObjectId } from "mongodb";

export class VistorModel {

    /** Vistor Id 
     * Create When Get Post Details
     */
    _id: ObjectId | string;

    /**
     * Vistor Is Not Boot
     * Create When Get Post Details With False
     * Update To Ture When User Active With Post Like Click On Url or Content or title ot Anything Of Page
     */
    isMakeActivityWithPost: boolean;

    loggedUserId:ObjectId|string;

    ip:string;

    countryCode:string;
}//End Class