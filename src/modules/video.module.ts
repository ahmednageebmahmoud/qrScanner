import { Request, Response } from "express";
import { BasicModule } from "./basic.module";
import { cols } from "../consts/collections.conse";
import { ObjectId } from "mongodb";
import { VideoModel } from "../models/video.model";
import { DateTimeService } from "../services/date.time.service";
import { UserService } from "../services/user.service";

export class VideoModule extends BasicModule {


    /**
 * New Video Id 
 */
    get newVideoLandingId() { return Math.random().toString(36).substr(2, 9) };



    /**
     * 
     * @param reqo Current Express Request
     * @param repos Current Express Reponse
     */
    constructor(private reqo: Request, private repos: Response) {
        super(reqo, repos);
    }




    /**
     * Add New Video
     * @param sho 
     */
    addNewVideo(video: VideoModel): void {
        video._id = new ObjectId();
        video.generatedDate = DateTimeService.getDateNowManual;
        video.userLoveIds = [];//Add Defult For Check If Array Whwn Aggregate   
        video.userNotLoveIds = [];
        video.userFavoriteIds = [];
        //Create New Document Now
        this.db.collection(cols.videos).insertOne(video).then(res => {
            if (!res.insertedId)
                return this.end_failed(this.resource.someErrorHasBeen);

            this.end_successfully(this.resource.contactUsSuccessfully, video);
        }).catch(this.catchError);
    }

    /**
   * Current User Make Love
   * Remove Current User From Not Love Array In (Videos And User Information Document)
   * Add Current User To Love Array In (Videos And User Information Document)
   * @param id 
   */
    love(id: string) {
        this.db.collection(cols.videos).countDocuments({
            _id: new ObjectId(id),
            userLoveIds: new ObjectId(this.loggedUser._id)
        }).then(count => {
            if (count)
                return this.end_successfully(this.resource.loveSuccessfully)

            //Update Video
            this.db.collection(cols.videos).updateOne({ _id: new ObjectId(id) },
                {
                    //Add To Love Array
                    $push: { userLoveIds: new ObjectId(this.loggedUser._id) },
                    //Remove From Not Love Array
                    $pull: { userNotLoveIds: new ObjectId(this.loggedUser._id) }
                }).then(res => {
                    if (!res.matchedCount)
                        return this.end_failed(this.resource.videoIsNotFound);
                    else if (!res.modifiedCount)
                        return this.end_successfully(this.resource.loveSuccessfully)

                    //Update User Information
                    this.db.collection(cols.users).updateOne({ _id: new ObjectId(this.loggedUser._id) }, {
                        //Add To Love Array
                        $push: { videosLoveIds: new ObjectId(id) },
                        //Remove From Not Love Array
                        $pull: { videosNotLoveIds: new ObjectId(id) }
                    });

                    return this.end_successfully(this.resource.loveSuccessfully)
                }).catch(err => this.catchError2(err, this));
        }).catch(err => this.catchError2(err, this));
    }

    /**
    * Current User Make Not Love
    * Remove Current User To Love Array In (Video And User Information Document)
    * Add Current User From Not Love Array  In (Video And User Information Document)
    * @param id 
    */
    notLove(id: string) {
        this.db.collection(cols.videos).countDocuments({
            _id: new ObjectId(id),
            userNotLoveIds: new ObjectId(this.loggedUser._id)
        }).then(count => {
            if (count)
                return this.end_successfully(this.resource.unLoveSuccessfully)
            //Update Video
            this.db.collection(cols.videos).updateOne({ _id: new ObjectId(id) },
                {
                    //Add To Not Love Array
                    $push: { userNotLoveIds: new ObjectId(this.loggedUser._id) },
                    //Remove From Love Array
                    $pull: { userLoveIds: new ObjectId(this.loggedUser._id) }
                }).then(res => {
                    if (!res.matchedCount)
                        return this.end_failed(this.resource.videoIsNotFound);

                    //Update User Information
                    this.db.collection(cols.users).updateOne({ _id: new ObjectId(this.loggedUser._id) }, {
                        //Add To Not Love Array
                        $push: { videosNotLoveIds: new ObjectId(id) },
                        //Remove From Love Array
                        $pull: { videosLoveIds: new ObjectId(id) }
                    });
                    return this.end_successfully(this.resource.unLoveSuccessfully)
                }).catch(err => this.catchError2(err, this));
        }).catch(err => this.catchError2(err, this));
    }

    /**
    * Current User Make Favorite Or Un Favorite
    * @param id 
    */
    favorite(id: string,) {

        let videoQuery = {}, userQuery = {};
        this.db.collection(cols.videos).countDocuments({
            _id: new ObjectId(id),
            userFavoriteIds: new ObjectId(this.loggedUser._id)
        }).then(count => {

            //Check If Favorite 
            if (count) {
                //Un-Favorite
                videoQuery = { $pull: { userFavoriteIds: new ObjectId(this.loggedUser._id) } };
                userQuery = { $pull: { videosFavoriteIds: new ObjectId(id) } }
            }
            else {
                //Favorite
                videoQuery = { $push: { userFavoriteIds: new ObjectId(this.loggedUser._id) } };
                userQuery = { $push: { videosFavoriteIds: new ObjectId(id) } }
            }
            //Update Video
            this.db.collection(cols.videos).updateOne({ _id: new ObjectId(id) }, videoQuery).then(res => {
                if (!res.matchedCount)
                    return this.end_failed(this.resource.videoIsNotFound);
                else if (!res.modifiedCount)
                    return this.end_successfully(count ? this.resource.unFavoriteSuccessfully : this.resource.favoriteSuccessfully)

                //Update User Information
                this.db.collection(cols.users).updateOne({ _id: new ObjectId(this.loggedUser._id) }, userQuery);

                return this.end_successfully(count ? this.resource.unFavoriteSuccessfully : this.resource.favoriteSuccessfully)
            }).catch(err => this.catchError2(err, this));
        }).catch(err => this.catchError2(err, this));

    }

    /**
     * Get Random Videos For Landing Page
     */
    getRandomVideos() {
        this.db.collection(cols.videos).aggregate<VideoModel>([{
            //For Random
            $sample: { size: 10 }
        }]).toArray(res => {
            this.end_successfully(this.resource.successfully, res);
        });
    }

    /**
     * Get Top Videos For Display In Videos Page
     */
    getTopVideos() {
        this.db.collection(cols.videos).aggregate<VideoModel>(
            [{ $match: { isInTop: true } },
            {
                $group: {
                    _id: "$videoCategoryTypeId",
                    videos: {
                        //  $push:"$$ROOT" //Root : The Full Document
                        $push: {

                            landingPageId: "$landingPageId",
                            resourceKey_Title: "$resourceKey_Title",
                            thumbnailImagePath: "$thumbnailImagePath",
                            counterViews: "$counterViews",
                        }
                    }
                }
            }
            ]).toArray((error, res) => {
                if (error)
                    this.end_failed(this.resource.someErrorHasBeen, error);
                else
                    this.end_successfully(this.resource.successfully, res);
            });
    }

    /**Get Videos By Category Id */
    getVideosByCategoryId(categoryId: string) {

        this.db.collection(cols.videos).aggregate<VideoModel>(
            [{ $match: { videoCategoryTypeId: categoryId } },
            {
                $project: {
                    _id: 1,
                    landingPageId: 1,
                    resourceKey_Title: 1,
                    thumbnailImagePath: 1,
                    counterViews: 1,
                    videoCategoryTypeId: 1
                }
            }]).toArray((error, res) => {
                if (error)
                    this.end_failed(this.resource.someErrorHasBeen, error);
                else if (res.length == 0)
                    this.end_info(this.resource.videosAreNotFound);
                else
                    this.end_successfully(this.resource.successfully, res);
            });
    }

    /**
     * Get Video Details For Display
     * @param videoId 
     */
    getVideoDetailsForDisplay(videoId: string) {

        this.db.collection(cols.videos).aggregate<VideoModel>([
            { $match: { landingPageId: videoId } },
            {
                $project: {
                    _id: 1,
                    landingPageId: 1,
                    resourceKey_Title: 1,
                    resourceKey_Describtion: 1,
                    resourceKey_keywords: 1,
                    videoPath: 1,
                    thumbnailImagePath: 1,
                    videoCategoryTypeId: 1,
                    generatedDate: 1,
                    counterViews: 1,
                    counterLove: { $size: "$userLoveIds" },
                    counterNotLove: { $size: "$userNotLoveIds" },
                    counterFavorite: { $size: "$userFavoriteIds" },
                    isCurrentUserLoved: { $in: [new ObjectId(this.loggedUser?._id), "$userLoveIds"] },
                    isCurrentUserNotLoved: { $in: [new ObjectId(this.loggedUser?._id), "$userNotLoveIds"] },
                    isCurrentUserFavorited: { $in: [new ObjectId(this.loggedUser?._id), "$userFavoriteIds"] },
                }
            }
        ]).toArray((error, videos) => {
            if (error)
                this.end_failed(this.resource.someErrorHasBeen, error);
            //Return Video Now
            else if (!videos?.length)
                this.end_info(this.resource.videoIsNotFound);
            else {
                //Increment Views Of Video
                videos[0].counterViews = (videos[0].counterViews | 0) + 1;
                this.db.collection(cols.videos).updateOne({ landingPageId: videoId }, { $set: { counterViews: videos[0].counterViews } });
                let secondDate: Date = DateTimeService.getDateNowManual;
                let dts = new DateTimeService();
                dts.resource = this.resource;
                dts.lanugageCode = this.languageCode;

                //Update User Created Picture Full Path And Post Date Time Since
                videos.forEach(s => {
                    s.generatedDateTimeSince = dts.getDateTimeSince(s.generatedDate, secondDate);
                });

                this.end_successfully(this.resource.successfully, videos[0]);
            }
        });
    }



    /**
       * Generate Video Id For Shortn
       */
    async generateNewLandingPageId(id: string = this.newVideoLandingId): Promise<void> {
        //Check If Dublicate
        if (await this.db.collection(cols.videos).countDocuments({ landingPageId: id }) == 0)
            this.end_successfully(this.resource.successfully, id);
        else
            this.end_successfully(this.resource.successfully, await this.generateNewLandingPageId(this.newVideoLandingId));
    }

}//End Class