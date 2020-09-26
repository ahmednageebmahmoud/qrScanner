import { ObjectId } from "mongodb"
import { ActionModel } from "./action.model";
import { FileSaveingModel } from "./file.saveing.model";
import { PostDefaultSettingModel } from "./post.default.setting.model";

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
    /** New Picture For Update Picture Account  */
    newPicture: FileSaveingModel;
    /**Language Code */
    languageCode: string;
    /**Post Default Settings For Used Deafult When Create Shortner Url  */
    postDefaultSettings: PostDefaultSettingModel;

    /**All Posts Creatged By This User */
    postsIds: ObjectId[];
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
}//End Class