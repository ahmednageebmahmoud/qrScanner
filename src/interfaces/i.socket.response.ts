import { ObjectId } from "mongodb";
import { PostModel } from "../models/post.model";

/**
 * I Socket Response
 */
export interface ISocketResponse {
     /**
     * To Check Increment counter Love To Post Or Video Or Other
     */
    incrementLoveCounter: boolean;
      /**
     * To Check Increment counter Not Love To Post Or Video Or Other
     */
    incrementNotLoveCounter: boolean;
      /**
     * To Check Increment counter Favorite To Post Or Video Or Other
     */
    incrementFavoriteCounter: boolean;
        /**
     * To Check UnsIncrement counter Love To Post Or Video Or Other
     */
    unIncrementLoveCounter: boolean;
      /**
     * To Check UnIncrement counter Not Love To Post Or Video Or Other
     */
    unIncrementNotLoveCounter: boolean;
      /**
     * To Check UnIncrement counter Favorite To Post Or Video Or Other
     */
    unIncrementFavoriteCounter: boolean;

    /** User EWmited This Event  */
    fromUserId:string|ObjectId;
  /**
   * New User Language Id
   */
  languageCode:string;


  /**
   * New Publish Post
   */
  newPost:PostModel;

}//End Interface