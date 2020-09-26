import { ObjectId } from "mongodb";
import { VideoCategoryTypeEnum } from "../consts/video.category.type.const";
import { SEOModel } from "./seo.model";

export class VideoModel {

  _id: string | ObjectId;
  /**Video Landing Page Id */
  landingPageId:string;
  /** Video Title */
  resourceKey_title: string;
  /** Video Path Form Website Or Ant Wahre */
  videoPath: string;
  /** Image Path Form Website Or Ant Wahre */
  thumbnailImagePath: string;
  /** Video Category Id */
  videoCategoryTypeId: string;
  /**Users Who Loved This Vide */
  userLoveIds: ObjectId[];
  /**Users Who Not Loved This Vide */
  userNotLoveIds: ObjectId[];
  /**Users Who Favorite This Vide */
  userFavoriteIds: ObjectId[];
  /** Is Current User Love This Vide */
  isCurrentUserLoved: boolean;
  /** Is Current User Not Love This Vide */
  isCurrentUserNotLoved: boolean;
  /** Is Current User Favorite This Vide */
  isCurrentUserFavorited: boolean;
  /** Number Of Love */
  counterLove: number;
  /** Number Of Not Love */
  counterNotLove: number;
  /** Number Of Favorite */
  counterFavorite: number;

  /** Number Of Views */
  counterViews: number;

    /**
   * Generated Date Time 
   * I Added Here For Use In Aggregate Faster
   */
    generatedDate: Date;

  /**
  * Generated Date Time Since Like >> 'One Houre Ago'
  */
  generatedDateTimeSince: string;

  /** True: For Show In Videos Page, Else: Not Show In Videos Page */
isInTop:boolean;


  seo: SEOModel;

  /** Post Landing Page Url */
  landingPageUrl:string;


}//End Class