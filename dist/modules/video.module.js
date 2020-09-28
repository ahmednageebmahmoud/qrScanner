"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VideoModule = void 0;
const basic_module_1 = require("./basic.module");
const collections_conse_1 = require("../consts/collections.conse");
const mongodb_1 = require("mongodb");
const date_time_service_1 = require("../services/date.time.service");
const socket_io_service_1 = require("../services/socket.io.service");
const congif_const_1 = require("../consts/congif.const");
class VideoModule extends basic_module_1.BasicModule {
    /**
     *
     * @param reqo Current Express Request
     * @param repos Current Express Reponse
     */
    constructor(reqo, repos) {
        super(reqo, repos);
        this.reqo = reqo;
        this.repos = repos;
    }
    /**
 * New Video Id
 */
    get newVideoLandingId() { return Math.random().toString(36).substr(2, 9); }
    ;
    /**
     * Add New Video
     * @param sho
     */
    addNewVideo(video) {
        video._id = new mongodb_1.ObjectId();
        video.generatedDate = date_time_service_1.DateTimeService.getDateNowManual;
        video.userLoveIds = []; //Add Defult For Check If Array Whwn Aggregate   
        video.userNotLoveIds = [];
        video.userFavoriteIds = [];
        //Create New Document Now
        this.db.collection(collections_conse_1.cols.videos).insertOne(video).then(res => {
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
    addActivityLove(id, isWasNotLove) {
        this.db.collection(collections_conse_1.cols.videos).countDocuments({
            _id: new mongodb_1.ObjectId(id),
            videosLoveIds: new mongodb_1.ObjectId(this.loggedUser._id)
        }).then(count => {
            if (count)
                return this.end_info(this.resource.unLoveSuccessfully);
            //Update Video
            this.db.collection(collections_conse_1.cols.videos).updateOne({ _id: new mongodb_1.ObjectId(id) }, {
                //Add To Love Array
                $push: { userLoveIds: new mongodb_1.ObjectId(this.loggedUser._id) },
                //Remove From Not Love Array
                $pull: { userNotLoveIds: new mongodb_1.ObjectId(this.loggedUser._id) }
            }).then(res => {
                if (!res.matchedCount)
                    return this.end_failed(this.resource.videoIsNotFound);
                else if (!res.modifiedCount)
                    return this.end_successfully(this.resource.loveSuccessfully);
                //Update User Information
                this.db.collection(collections_conse_1.cols.users).updateOne({ _id: new mongodb_1.ObjectId(this.loggedUser._id) }, {
                    //Add To Love Array
                    $push: { videosLoveIds: { actionDate: date_time_service_1.DateTimeService.getDateNowManual, targetId: new mongodb_1.ObjectId(id) } },
                    //Remove From Not Love Array
                    $pull: { videosNotLoveIds: { targetId: new mongodb_1.ObjectId(id) } }
                }).catch();
                //Pass This Love To Cinet Side
                socket_io_service_1.SocketIOService.sendVideoAction(id, {
                    incrementLoveCounter: true,
                    unIncrementNotLoveCounter: isWasNotLove,
                    fromUserId: this.loggedUser._id
                });
                return this.end_successfully(this.resource.loveSuccessfully);
            }).catch(err => this.catchError2(err, this));
        }).catch(err => this.catchError2(err, this));
    }
    /**
    * Current User Make Not Love
    * Remove Current User To Love Array In (Video And User Information Document)
    * Add Current User From Not Love Array  In (Video And User Information Document)
    * @param id
    */
    addActivityNotLove(id, isWasLove) {
        this.db.collection(collections_conse_1.cols.videos).countDocuments({
            _id: new mongodb_1.ObjectId(id),
            userNotLoveIds: new mongodb_1.ObjectId(this.loggedUser._id)
        }).then(count => {
            if (count)
                return this.end_info(this.resource.unLoveSuccessfully);
            //Update Video
            this.db.collection(collections_conse_1.cols.videos).updateOne({ _id: new mongodb_1.ObjectId(id) }, {
                //Add To Not Love Array
                $push: { userNotLoveIds: new mongodb_1.ObjectId(this.loggedUser._id) },
                //Remove From Love Array
                $pull: { userLoveIds: new mongodb_1.ObjectId(this.loggedUser._id) }
            }).then(res => {
                if (!res.matchedCount)
                    return this.end_failed(this.resource.videoIsNotFound);
                //Update User Information
                this.db.collection(collections_conse_1.cols.users).updateOne({ _id: new mongodb_1.ObjectId(this.loggedUser._id) }, {
                    //Add To Not Love Array
                    $push: { videosNotLoveIds: { actionDate: date_time_service_1.DateTimeService.getDateNowManual, targetId: new mongodb_1.ObjectId(id) } },
                    //Remove From Love Array
                    $pull: { videosLoveIds: { targetId: new mongodb_1.ObjectId(id) } }
                }).catch();
                //Pass This Not Love To Cinet Side
                socket_io_service_1.SocketIOService.sendVideoAction(id, {
                    incrementNotLoveCounter: true,
                    unIncrementLoveCounter: isWasLove,
                    fromUserId: this.loggedUser._id
                });
                return this.end_successfully(this.resource.unLoveSuccessfully);
            }).catch(err => this.catchError2(err, this));
        }).catch(err => this.catchError2(err, this));
    }
    /**
    * Current User Make Favorite Or Un Favorite
    * @param id
    */
    addActivityFavorite(id) {
        let videoQuery = {}, userQuery = {};
        this.db.collection(collections_conse_1.cols.videos).countDocuments({
            _id: new mongodb_1.ObjectId(id),
            userFavoriteIds: new mongodb_1.ObjectId(this.loggedUser._id)
        }).then(count => {
            //Check If Favorite 
            if (count) {
                //Un-Favorite
                videoQuery = { $pull: { userFavoriteIds: new mongodb_1.ObjectId(this.loggedUser._id) } };
                userQuery = { $pull: { videosFavoriteIds: { targetId: new mongodb_1.ObjectId(id) } } };
            }
            else {
                //Favorite
                videoQuery = { $push: { userFavoriteIds: new mongodb_1.ObjectId(this.loggedUser._id) } };
                userQuery = { $push: { videosFavoriteIds: { actionDate: date_time_service_1.DateTimeService.getDateNowManual, targetId: new mongodb_1.ObjectId(id) } } };
            }
            //Update Video
            this.db.collection(collections_conse_1.cols.videos).updateOne({ _id: new mongodb_1.ObjectId(id) }, videoQuery).then(res => {
                if (!res.matchedCount)
                    return this.end_failed(this.resource.videoIsNotFound);
                else if (!res.modifiedCount)
                    return this.end_successfully(count ? this.resource.unFavoriteSuccessfully : this.resource.favoriteSuccessfully);
                //Update User Information
                this.db.collection(collections_conse_1.cols.users).updateOne({ _id: new mongodb_1.ObjectId(this.loggedUser._id) }, userQuery).catch();
                //Pass This Favorite To Cinet Side
                socket_io_service_1.SocketIOService.sendVideoAction(id, {
                    incrementFavoriteCounter: count == 0,
                    unIncrementFavoriteCounter: count > 0,
                    fromUserId: this.loggedUser._id
                });
                return this.end_successfully(count ? this.resource.unFavoriteSuccessfully : this.resource.favoriteSuccessfully);
            }).catch(err => this.catchError2(err, this));
        }).catch(err => this.catchError2(err, this));
    }
    /**
     * Get Random Videos For Landing Page
     */
    getRandomVideos() {
        this.db.collection(collections_conse_1.cols.videos).aggregate([{
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
        this.db.collection(collections_conse_1.cols.videos).aggregate([{ $match: { isInTop: true } },
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
    getVideosByCategoryId(categoryId) {
        this.db.collection(collections_conse_1.cols.videos).aggregate([{ $match: { videoCategoryTypeId: categoryId } },
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
    getVideoDetailsForDisplay(videoId) {
        var _a, _b, _c;
        this.db.collection(collections_conse_1.cols.videos).aggregate([
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
                    isCurrentUserLoved: { $in: [new mongodb_1.ObjectId((_a = this.loggedUser) === null || _a === void 0 ? void 0 : _a._id), "$userLoveIds"] },
                    isCurrentUserNotLoved: { $in: [new mongodb_1.ObjectId((_b = this.loggedUser) === null || _b === void 0 ? void 0 : _b._id), "$userNotLoveIds"] },
                    isCurrentUserFavorited: { $in: [new mongodb_1.ObjectId((_c = this.loggedUser) === null || _c === void 0 ? void 0 : _c._id), "$userFavoriteIds"] },
                }
            }
        ]).toArray((error, videos) => {
            if (error)
                this.end_failed(this.resource.someErrorHasBeen, error);
            //Return Video Now
            else if (!(videos === null || videos === void 0 ? void 0 : videos.length))
                this.end_info(this.resource.videoIsNotFound);
            else {
                //Increment Views Of Video
                videos[0].counterViews = (videos[0].counterViews | 0) + 1;
                this.db.collection(collections_conse_1.cols.videos).updateOne({ landingPageId: videoId }, { $set: { counterViews: videos[0].counterViews } });
                let secondDate = date_time_service_1.DateTimeService.getDateNowManual;
                let dts = new date_time_service_1.DateTimeService();
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
    getVideosActivities(skip, limit, isLovedVideos, isNotLovedVideos = false, isFavoriteVideos = false) {
        let localFieldTarget, unwindFoeldTarget;
        let sortStage = {};
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
        this.db.collection(collections_conse_1.cols.users).aggregate([
            { $match: { "_id": new mongodb_1.ObjectId(this.loggedUser._id) } },
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
                    thumbnailImagePath: { $concat: [congif_const_1.config.websiteUrl, "/", "$video.thumbnailImagePath"] },
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
                    return this.end_info(this.resource.noVideosFound, true);
                else
                    return this.end_info(this.resource.noMoreVideos, true);
            return this.end_successfully(this.resource.successfully, arr);
        });
    }
    /**
       * Generate Video Id For Shortn
       */
    generateNewLandingPageId(id = this.newVideoLandingId) {
        return __awaiter(this, void 0, void 0, function* () {
            //Check If Dublicate
            if ((yield this.db.collection(collections_conse_1.cols.videos).countDocuments({ landingPageId: id })) == 0)
                this.end_successfully(this.resource.successfully, id);
            else
                this.end_successfully(this.resource.successfully, yield this.generateNewLandingPageId(this.newVideoLandingId));
        });
    }
    /** Current User Remove Love    */
    removeActivityLove(id) {
        //Remove User Id From Video Loves Arry
        this.db.collection(collections_conse_1.cols.videos).updateOne({ _id: new mongodb_1.ObjectId(id) }, {
            $pull: { "userLoveIds": new mongodb_1.ObjectId(this.loggedUser._id) }
        }).then(res => {
            //Remove Video Id From Uswer Videos Love Arry
            this.db.collection(collections_conse_1.cols.users).updateOne({ _id: new mongodb_1.ObjectId(this.loggedUser._id) }, {
                $pull: { "videosLoveIds": { targetId: new mongodb_1.ObjectId(id) } }
            });
            return this.end_successfully(this.resource.removedVideoFromLoveList);
        }).catch(c => this.catchError(c));
    }
    /** Current User Remove Not Love    */
    removeActivityNotLove(id) {
        //Remove User Id From Video Not Loves Arry
        this.db.collection(collections_conse_1.cols.videos).updateOne({ _id: new mongodb_1.ObjectId(id) }, {
            $pull: { "userNotLoveIds": new mongodb_1.ObjectId(this.loggedUser._id) }
        }).then(res => {
            //Remove Video Id From User Videos Not Love Arry
            this.db.collection(collections_conse_1.cols.users).updateOne({ _id: new mongodb_1.ObjectId(this.loggedUser._id) }, {
                $pull: { "videosNotLoveIds": { targetId: new mongodb_1.ObjectId(id) } }
            });
            return this.end_successfully(this.resource.removedVideoFromNotLoveList);
        }).catch(c => this.catchError(c));
    }
    /** Current User Remove Favorite   */
    removeActivityFavorite(id) {
        //Remove User Id From Video Favorites Arry
        this.db.collection(collections_conse_1.cols.videos).updateOne({ _id: new mongodb_1.ObjectId(id) }, {
            $pull: { "userFavoriteIds": new mongodb_1.ObjectId(this.loggedUser._id) }
        }).then(res => {
            //Remove Video Id From User Videos Favorite Arry
            this.db.collection(collections_conse_1.cols.users).updateOne({ _id: new mongodb_1.ObjectId(this.loggedUser._id) }, {
                $pull: { "videosFavoriteIds": { targetId: new mongodb_1.ObjectId(id) } }
            });
            return this.end_successfully(this.resource.removedVideoFromFavoriteList);
        }).catch(c => this.catchError(c));
    }
} //End Class
exports.VideoModule = VideoModule;
//# sourceMappingURL=video.module.js.map