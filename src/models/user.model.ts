import { ObjectId } from "mongodb"
import { FileSaveingModel } from "./file.saveing.model";
import { PostDefaultSettingModel } from "./post.default.setting.model";

export class UserModel{
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
    isGoogelPicture:boolean;
    /** New Picture For Update Picture Account  */
    newPicture:FileSaveingModel;
    /**Language Code */
    languageCode:string;
    /**Post Default Settings For Used Deafult When Create Shortner Url  */
    postDefaultSettings: PostDefaultSettingModel;
   
    /**All Posts Creatged By This User */
    postsIds: ObjectId[];
    /**All Posts Loved By This User */
    postsLoveIds: ObjectId[];
    /**All Posts Not Loved By This User */
    postsNotLoveIds: ObjectId[];
    /**All Posts Favorite By This User */
    postsFavoriteIds: ObjectId[];
}