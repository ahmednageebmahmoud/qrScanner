import { Request, Response } from "express";
import { BasicModule } from "./basic.module";
import { cols } from "../consts/collections.conse";
import { ObjectId } from "mongodb";
import { VideoModel } from "../models/video.model";
import { DateTimeService } from "../services/date.time.service";
import { UserService } from "../services/user.service";
import { SocketIOService } from "../services/socket.io.service";
import { SocketIOEvents } from "../consts/socket.io.events.const";
import { ISocketResponse } from "../interfaces/i.socket.response";
import { ActionModel } from "../models/action.model";
import { config } from "../consts/congif.const";

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
    addActivityLove(id: string, isWasNotLove: boolean) {
        this.db.collection(cols.videos).countDocuments({
            _id: new ObjectId(id),
            videosLoveIds: new ObjectId(this.loggedUser._id)
        }).then(count => {
            if (count)
                return this.end_info(this.resource.unLoveSuccessfully);

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
                        $push: { videosLoveIds: <ActionModel>{ actionDate: DateTimeService.getDateNowManual, targetId: new ObjectId(id) } },
                        //Remove From Not Love Array
                        $pull: { videosNotLoveIds: { targetId: new ObjectId(id) } }
                    }).catch();


                    //Pass This Love To Cinet Side
                    SocketIOService.sendVideoAction(id, <ISocketResponse>{
                        incrementLoveCounter: true,
                        unIncrementNotLoveCounter: isWasNotLove, //معنى ذالك انة تم حذف عنص ايضا من مصفوفة الغير محبين
                        fromUserId: this.loggedUser._id
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
    addActivityNotLove(id: string, isWasLove: boolean) {
        this.db.collection(cols.videos).countDocuments({
            _id: new ObjectId(id),
            userNotLoveIds: new ObjectId(this.loggedUser._id)
        }).then(count => {
            if (count)
                return this.end_info(this.resource.unLoveSuccessfully);
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
                        $push: { videosNotLoveIds: <ActionModel>{ actionDate: DateTimeService.getDateNowManual, targetId: new ObjectId(id) } },
                        //Remove From Love Array
                        $pull: { videosLoveIds: { targetId: new ObjectId(id) } }
                    }).catch();


                    //Pass This Not Love To Cinet Side
                    SocketIOService.sendVideoAction(id, <ISocketResponse>{
                        incrementNotLoveCounter: true,
                        unIncrementLoveCounter: isWasLove, //معنى ذالك انة تم حذف عنص ايضا من مصفوفة محبين
                        fromUserId: this.loggedUser._id

                    });
                    return this.end_successfully(this.resource.unLoveSuccessfully)
                }).catch(err => this.catchError2(err, this));
        }).catch(err => this.catchError2(err, this));
    }

    /**
    * Current User Make Favorite Or Un Favorite
    * @param id 
    */
    addActivityFavorite(id: string,) {
        let videoQuery = {}, userQuery = {};
        this.db.collection(cols.videos).countDocuments({
            _id: new ObjectId(id),
            userFavoriteIds: new ObjectId(this.loggedUser._id)
        }).then(count => {

            //Check If Favorite 
            if (count) {
                //Un-Favorite
                videoQuery = { $pull: { userFavoriteIds: new ObjectId(this.loggedUser._id) } };
                userQuery = { $pull: { videosFavoriteIds: { targetId: new ObjectId(id) } } }
            }
            else {
                //Favorite
                videoQuery = { $push: { userFavoriteIds: new ObjectId(this.loggedUser._id) } };
                userQuery = { $push: { videosFavoriteIds: <ActionModel>{ actionDate: DateTimeService.getDateNowManual, targetId: new ObjectId(id) } } }
            }
            //Update Video
            this.db.collection(cols.videos).updateOne({ _id: new ObjectId(id) }, videoQuery).then(res => {
                if (!res.matchedCount)
                    return this.end_failed(this.resource.videoIsNotFound);
                else if (!res.modifiedCount)
                    return this.end_successfully(count ? this.resource.unFavoriteSuccessfully : this.resource.favoriteSuccessfully)

                //Update User Information
                this.db.collection(cols.users).updateOne({ _id: new ObjectId(this.loggedUser._id) }, userQuery).catch();


                //Pass This Favorite To Cinet Side
                SocketIOService.sendVideoAction(id, <ISocketResponse>{
                    incrementFavoriteCounter: count == 0,
                    unIncrementFavoriteCounter: count > 0,
                    fromUserId: this.loggedUser._id

                });

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
                            resourceKey_title: "$resourceKey_title",
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
                    resourceKey_title: 1,
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
                    resourceKey_title: 1,
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
     * Get Videos Current User Loved
     */
    getVideosActivities(skip: number, limit: number, isLovedVideos: boolean, isNotLovedVideos: boolean = false, isFavoriteVideos: boolean = false) {
        let localFieldTarget: string, unwindFoeldTarget: string;
        let sortStage: any = {};
        if (isLovedVideos) {
            localFieldTarget = "videosLoveIds";
            sortStage = { $sort: { "videosLoveIds.actionDate": -1 } };
        }
        else if (isNotLovedVideos) {
            localFieldTarget = "videosNotLoveIds";
            sortStage = { $sort: { "videosNotLoveIds.actionDate": -1 } };
        }
        else if (isFavoriteVideos) {
            localFieldTarget = "videosFavoriteIds";
            sortStage = { $sort: { "videosFavoriteIds.actionDate": -1 } };
        }

        unwindFoeldTarget = "$" + localFieldTarget;
        localFieldTarget = localFieldTarget + ".targetId";

        this.db.collection(cols.users).aggregate<VideoModel>([
            { $match: { "_id": new ObjectId(this.loggedUser._id) } },
            { $unwind: unwindFoeldTarget },
            { $lookup: { from: "videos", localField: localFieldTarget, foreignField: "_id", as: "video" } },
            { $unwind: "$video" },
            sortStage,
            { $skip: skip, },
            { $limit: limit },
            {
                $project: {
                    _id: "$video._id",
                    landingPageId: "$video.landingPageId",
                    thumbnailImagePath: { $concat: [config.websiteUrl, "/", "$video.thumbnailImagePath"] },
                    resourceKey_title: "$video.resourceKey_title",
                    videoCategoryTypeId: "$video.videoCategoryTypeId",
                    counterViews: "$video.counterViews",
                    counterLove: { $size: "$video.userLoveIds" },
                    counterNotLove: { $size: "$video.userNotLoveIds" },
                    counterFavorite: { $size: "$video.userFavoriteIds" },
                }
            }
        ]).toArray((error, arr) => {

            if (error)
                return this.end_failed(this.resource.someErrorHasBeen, error);

            if (arr.length == 0)
                if (skip == 0)
                    return this.end_info(this.resource.noVideosFound, true)
                else
                    return this.end_info(this.resource.noMoreVideos, true)
            return this.end_successfully(this.resource.successfully, arr);
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



    /** Current User Remove Love    */
    removeActivityLove(id: string) {

        //Remove User Id From Video Loves Arry
        this.db.collection(cols.videos).updateOne({ _id: new ObjectId(id) }, {
            $pull: { "userLoveIds": new ObjectId(this.loggedUser._id) }
        }).then(res => {

            //Remove Video Id From Uswer Videos Love Arry
            this.db.collection(cols.users).updateOne({ _id: new ObjectId(this.loggedUser._id) }, {
                $pull: { "videosLoveIds": { targetId: new ObjectId(id) } }
            });
            return this.end_successfully(this.resource.removedVideoFromLoveList);
        }).catch(c => this.catchError(c));
    }

    /** Current User Remove Not Love    */
    removeActivityNotLove(id: string) {
        //Remove User Id From Video Not Loves Arry
        this.db.collection(cols.videos).updateOne({ _id: new ObjectId(id) }, {
            $pull: { "userNotLoveIds": new ObjectId(this.loggedUser._id) }
        }).then(res => {

            //Remove Video Id From User Videos Not Love Arry
            this.db.collection(cols.users).updateOne({ _id: new ObjectId(this.loggedUser._id) }, {
                $pull: { "videosNotLoveIds": { targetId: new ObjectId(id) } }
            });
            return this.end_successfully(this.resource.removedVideoFromNotLoveList);
        }).catch(c => this.catchError(c));
    }

    /** Current User Remove Favorite   */
    removeActivityFavorite(id: string) {
        //Remove User Id From Video Favorites Arry
        this.db.collection(cols.videos).updateOne({ _id: new ObjectId(id) }, {
            $pull: { "userFavoriteIds": new ObjectId(this.loggedUser._id) }
        }).then(res => {

            //Remove Video Id From User Videos Favorite Arry
            this.db.collection(cols.users).updateOne({ _id: new ObjectId(this.loggedUser._id) }, {
                $pull: { "videosFavoriteIds": { targetId: new ObjectId(id) } }
            });
            return this.end_successfully(this.resource.removedVideoFromFavoriteList);
        }).catch(c => this.catchError(c));
    }


}//End Class