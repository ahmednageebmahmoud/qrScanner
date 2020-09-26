import { ObjectId } from "mongodb";
import { UserModel } from "./user.model";
import { PostAdvertisemetnModel } from "./post.advertisement.model";
import { FileSaveingModel } from "./file.saveing.model";
import { SEOModel } from "./seo.model";
import { VistorModel } from "./vistor.model";

export class PostModel {
    _id: ObjectId;
    /** Post Title
     * وسوف ييستخدم لـ آرشفة جوجل
     */
    title: string;
    /** Post Content 
    */
    content: string;
    /** Post Id For Access To Post From URL as 'u5.co/_xdcd5' */
    landingPageId: string;

    /**
     * Post Language Code
     */
    languageCode  : string;

    /**
     * Generated Date Time 
     * I Added Here For Use In Aggregate Faster
     */
    generatedDate: Date;
    /** Is Active  */
    isActive: boolean|string;
    /** Is Public : For Display In Posts Page To Any User */
    isPublic: boolean|string;
    /** Advertisement Setting */
    advertisement: PostAdvertisemetnModel;
    /** 
     * Post Seo Model
     * سوف يتم ملئها تلقائايا بناء على اول رابط 
     * واذا اراد ان يعدلها فـ لا يوجد مشكلة
     */
  //  seo: PostSeoModel;

    /** Post Image Path */
    photoPath: string;

    /** New Post Image   */
    newImage: FileSaveingModel;

    //-+-+-+-+-+-++-+-++-+-+-+-+-+-+-+


    /** User Created 'Id' */
    userId: ObjectId;
    /** User Created 'UserName' : For Get All Posts By User Names In Posts Page */
    userName: string;
    /**
     * User Mac Address Fro Check From Valid Vistor
     */
    userMacAddress: string;

    /** Post Seo */
    seo:SEOModel;

    /** Urls Target */
    urls: string[];
    /**Users Who Loved This Post */
    userLoveIds: ObjectId[];
    /**Users Who Not Loved This Post */
    userNotLoveIds: ObjectId[];
    /**Users Who Favorite This Post */
    userFavoriteIds: ObjectId[];

    /** User Created Information */
    userCreated: UserModel;
    /** Is Current User Love This Post */
    isCurrentUserLoved: boolean;
    /** Is Current User Not Love This Post */
    isCurrentUserNotLoved: boolean;
    /** Is Current User Favorite This Post */
    isCurrentUserFavorited: boolean;
    /** Number Of Love */
    counterLove: number;
    /** Number Of Not Love */
    counterNotLove: number;
    /** Number Of Favorite */
    counterFavorite: number;

    /** Number Of Post Urls  */
    urlsCount:number;

       /**
     * Generated Date Time Since Like >> 'One Houre Ago'
     */
    generatedDateTimeSince:string;


/** Post Vistors */
    vistors:VistorModel[];

    /** Curretn Vistor */
    currentVistor:VistorModel;
   
/** Post Landing Page Url */
    landingPageUrl:string;

    /**Use In Filter */
    url:string;
}