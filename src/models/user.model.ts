import { ObjectId } from "mongodb"
import { ActionModel } from "./action.model";
import { FileSaveingModel } from "./file.saveing.model";

import { PostModel } from "./post.model";

export class UserModel {
    /**User Id */
    _id: ObjectId;
    /**User Name Fro Login And This Is Uniq  */
    userName: string;
    /**Full Name */
    fullName: string;
    /**Googel Account Id And This Is Uniq */
    googelId: string;
    /**Email And This Is Uniq*/
    email: string;
    /**Password Bu Hashed */
    password: string;
    /**Created Account Date Time */
    generatedDate: Date;
    /**Image Url Saved In Server */
    picturePath: string;
    /** Is Cuurent 'Picture Path' From Goggel */
    isGoogelPicture: boolean;
   
    /**Language Code */
    languageCode: string;
 
    /**All Posts Created By This User */
    posts: PostModel[];
    /**All Posts Loved By This User */
    postsLoveIds: ActionModel[];
    /**All Posts Not Loved By This User */
    postsNotLoveIds: ActionModel[];
    /**All Posts Favorite By This User */
    postsFavoriteIds: ActionModel[];

    /**All Videos Loved By This User */
    videosLoveIds: ActionModel[];
    /**All Videos Not Loved By This User */
    videosNotLoveIds: ActionModel[];
    /**All Videos Favorite By This User */
    videosFavoriteIds: ActionModel[];

    /** 
     * Reset Password Code Sent To User Email
     */
    resetPasswordCode: number;

    /**
     * For Check Is Current User Has Password
     */
    isHasPassword:boolean;

    /**
     * Paypal Email For Recive Payments
     */
    paypalEmail:string;
    phoneNumber:string;
    countryId:string;
    newPassword:string;
}//End Class