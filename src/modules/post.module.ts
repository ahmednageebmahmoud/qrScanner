import express, { Request, Response, Router } from 'express';
import { BasicModule } from "./basic.module";
import { cols } from '../consts/collections.conse';
import { PostModel } from '../models/post.model';
import { ObjectId } from 'mongodb';
import { config } from '../consts/congif.const';
import { DashbordInformation } from '../models/dashbord.information';
import { PostDefaultSettingModel } from '../models/post.default.setting.model';
import { UserModel } from '../models/user.model';
import { PostAdvertisemetnModel } from '../models/post.advertisement.model';
import { PostSeoModel } from '../models/post.seo.model';
import { FileService } from '../services/file.services';
import * as formidable from "formidable";
import * as fs from "fs";
import * as path from "path";
import { json } from 'body-parser';
import { UserService } from '../services/user.service';
import { DateTimeService } from '../services/date.time.service';

export class PostModule extends BasicModule {
    /**
     * new Post Id 
     */
    get newPostId() { return Math.random().toString(36).substr(2, 9) };



    constructor(rrq: Request, rrs: Response) {
        super(rrq, rrs);
    }


    /**
     * Create New Post
     * @param post 
     */
    async create() {
        let form = new formidable.IncomingForm();
        let post: PostModel;

        form.parse(this.req, async (formParseError, fields, files) => {
            //Return Error I Icant Saved Image
            if (formParseError)
                return this.end_failed(this.resource.iCouldNotSavePostImage);

            //Parse Json To Object Now
            post = JSON.parse(fields["postInfo"].toString());

            //Generate New Landing Id
            post.landingPageId = await this.generateNewId(this.newPostId)

            //Check If Saved Post Have A Image
            if (files.image) {
                //Rename Post Image To Append Landing Page Id To Path
                post.photoPath = `/files/posts/${post.landingPageId}_${files.image.name.replace(/ /gm, '')}`;
                fs.rename(files.image.path, path.join(__dirname, '..', post.photoPath), renamePostImageError => {
                    //Return Error I Cound Not Rename
                    if (renamePostImageError)
                        return this.end_failed(this.resource.iCouldNotSavePostImage);
                    this.createPost(post);
                });
            } else {
                this.createPost(post);
            }
        });
    }


    /**
     * Create Post In DataBase
     * @param post 
     */
    private createPost(post: PostModel) {

        //Add Another Post Information
        post.userId = new ObjectId(this.loggedUser._id);
        post.userName = this.loggedUser.userName;
        post.generatedDate = DateTimeService.getDateNowManual;
        post.content = post.content.replace(/\"/gm, "'");
        post.userLoveIds = [];//Add Defult For Check If Array Whwn Aggregate
        post.userNotLoveIds = [];
        post.userFavoriteIds = [];

        //Create New Document Now
        this.db.collection(cols.posts).insertOne(post).then(res => {
            if (!res.insertedId)
                return this.end_failed(this.resource.iCouldNotCreateNewPost);

            //Add Id To Current User Document
            if (this.loggedUser?._id)
                this.db.collection(cols.users).updateOne({ _id: new ObjectId(this.loggedUser._id) }, {
                    $push: { postsIds: post._id }
                });

            this.end_successfully(this.resource.postCreatedSuccessfully, { landingPageId: post.landingPageId });
        }).catch(this.catchError);
    }

    /**
     * 
     * Update Post 
     * @param sho 
     */
    update(post: PostModel) {
        if (!post?._id)
            return this.end_failed(this.resource.idIsNotFound);

        //Save Pst Image If Passed New
        if (post.newImage) {
            post.photoPath = FileService.saveFileSync(post.newImage, "post");
            if (!post.photoPath)
                return this.end_failed(this.resource.iCouldNotSaveNewPicture);
        }


        this.db.collection(cols.posts).updateOne({ _id: new ObjectId(post._id), userId: new ObjectId(this.loggedUser._id) }, {
            $set: <PostModel>{
                title: post.title,
                content: post.content,
                isActive: post.isActive,
                isPublic: post.isPublic,
                urls: post.urls,
                advertisement: this.fillAdvertisement(post.advertisement),
                //  seo: this.fillSeo(post.seo)
            }
        })
            .then(res => {
                //Check IF Found Post
                if (res.matchedCount == 0)
                    return this.end_failed(this.resource.postIsNotFound);
                else if (res.modifiedCount == 0)
                    return this.end_info(this.resource.thereAreNoNewModifications);

                this.end_successfully(this.resource.updated);
            }).catch(this.catchError);
    }




    /**
     *  Get Posts For Logged User
     * @param skip 
     * @param postlastId Get  Posts Generated Before Last  Post Date Selected 'For Paging'
     */
    getMyPosts(isPublic: string, isActive: string, limit: number, postlastId: string) {

        //Filter stage
        let basicFilterST: any = { $match: { _id: new ObjectId(this.loggedUser._id) } };

        if (isActive == "true" || isActive == "false") basicFilterST["$match"].isActive = isActive;
        if (isPublic == "true" || isPublic == "false") basicFilterST["$match"].isPublic = isPublic;

        let skipST: any = { $match: {} };

        //Get  Posts Generated Before Last  Post Date Selected 'For Paging'
        if (postlastId) {
            skipST["$match"] = { "post.generatedDate": { $lt: new ObjectId(postlastId).getTimestamp() } };
        }

        this.db.collection(cols.users).aggregate<PostModel>
            ([
                basicFilterST,
                { $lookup: { from: "posts", localField: "postsIds", foreignField: "_id", as: "post" } },
                {
                    $unwind: "$post"
                },
                { $sort: { "post.generatedDate": -1, } },
                skipST,
                { $limit: limit },
                {
                    $project: {
                        _id: "$post._id",
                        title: "$post.title",
                        generatedDate: "$post.generatedDate",
                        counterLove: { $size: "$post.userLoveIds" },
                        counterNotLove: { $size: "$post.userNotLoveIds" },
                        counterFavorite: { $size: "$post.userFavoriteIds" },
                    }
                }
            ])
            .toArray().then(res => {
                //Check From Length
                if (res.length == 0) {
                    if (!postlastId)//Check For First Time
                        return this.end_info(this.resource.iNotFoundAnyPost)
                    return this.end_info(this.resource.noMorePosts)
                }

                this.end_successfully(this.resource.successfully, res);
            }).catch(eror => this.catchError2(eror, this));
    }

    /**
     * Generate Post Id For Shortn
     */
    async generateNewId(id: string): Promise<string> {
        //Check If Dublicate
        if (await this.db.collection(cols.posts).countDocuments({ landingPageId: id }) == 0) return id;

        return await this.generateNewId(this.newPostId);
    }


    /**
     * 
     * @param isApplyOnLastPosts For Append This Setting On ALl Last Posts
     * @param setting New Setting 
     */
    updateDefultSetting(isApplyOnLastPosts: string, setting: PostDefaultSettingModel) {
        //Update Now
        this.db.collection(cols.users).updateOne({ _id: new ObjectId(this.loggedUser._id) },
            {
                $set: <UserModel>{
                    postDefaultSettings: {
                        advertisement: this.fillAdvertisement(setting.advertisement),
                        isPublic: setting.isPublic,
                    }
                }
            }).then(up => {
                //Updatet All Last Posts
                if (!isApplyOnLastPosts)
                    return this.end_successfully(this.resource.updated);

                this.db.collection(cols.posts).updateMany({ userId: new ObjectId(this.loggedUser._id) }, {
                    $set: <PostModel>{
                        advertisement: this.fillAdvertisement(setting.advertisement),
                        isPublic: setting.isPublic,
                    }
                }).then(res => {
                    this.end_successfully(this.resource.updatedPostsCount.replace('num', res.modifiedCount.toString()));
                }).catch(err => this.catchError2(err, this));
            }).catch(err => this.catchError2(err, this));

    }

    /**
     * Get Post Details 
     * @param landingPageId 
     */
    getPostDetails(landingPageId: string) {
        if (!landingPageId)
            return this.end_failed(this.resource.postIsNotFound);
        let loggedUserId = this.loggedUser?._id;
        this.db.collection(cols.posts).aggregate<PostModel>(
            [
                { $match: { landingPageId: landingPageId, isActive: true } },
                { $lookup: { from: "users", localField: "userId", foreignField: "_id", as: "userCreated" } },
                {
                    $unwind: {
                        path: "$userCreated",
                        preserveNullAndEmptyArrays: true
                    }
                },
                {
                    $project: {
                        _id: 1,
                        title: 1,
                        content: 1,
                        language: 1,
                        advertisement: 1,
                        urls: 1,
                        landingPageId: 1,
                        photoPath: 1,
                        isCurrentUserLoved: { $in: [new ObjectId(loggedUserId), "$userLoveIds"] },
                        isCurrentUserNotLoved: { $in: [new ObjectId(loggedUserId), "$userNotLoveIds"] },
                        isCurrentUserFavorited: { $in: [new ObjectId(loggedUserId), "$userFavoriteIds"] },

                    counterLove: { $size: "$userLoveIds" },
                        counterNotLove: { $size: "$userNotLoveIds" },
                        counterFavorite: { $size: "$userFavoriteIds" },

                        userCreated: {
                            userName: "$userCreated.userName",
                            displayName: { $ifNull: ["$userCreated.fullName", "$userCreated.userName"] },
                            picturePath: "$userCreated.picturePath",
                            isGoogelPicture: "$userCreated.isGoogelPicture",
                        }
                    },

                }
            ]).toArray()
            .then(res => {
                let post = res[0];
                if (!post) return this.end_failed(this.resource.postIsNotFound);

                post.photoPath = post.photoPath ? (config.apiFullPath + post.photoPath) : null;
                //Update User Picture Path
                post.userCreated.picturePath = UserService.getUserPicturePath(post.userCreated);

                this.end_successfully(this.resource.successfully, post);
            }).catch(err => this.catchError2(err, this));
    }


    /**
     * Get Posts
     * @param limit Limit Of Result
     * @param lastPostId Last Post Id For Skip
     * @param postLanguageCode Filter By Language Code
     * @param currentUserAction Filter By Current User Action (Love,NotLove,Favorite)
     * @param createdUserName Filter By User Name
     */
    getPosts(limit: number, lastPostId: string, postLanguageCode: string, currentUserAction: string, createdUserName: string) {

        let matchST: any = {
            $match: {
                isActive: true,
                isPublic: true
            }
        };

        //Append More Filter To Match
        if (postLanguageCode != 'null')
            matchST["$match"].languageCode = postLanguageCode;
        if (createdUserName != 'null')
            matchST["$match"].userName = createdUserName;

        //Filter By Current User Action, Add Field To Project Fo
        if (currentUserAction == "love")
            matchST['$match']['userLoveIds'] = { $elemMatch: { '$eq': new ObjectId(this.loggedUser._id) } };
        else if (currentUserAction == "notLove")
            matchST['$match']['userNotLoveIds'] = { $elemMatch: { '$eq': new ObjectId(this.loggedUser._id) } };
        else if (currentUserAction == "favorite")
            matchST['$match']['userFavoriteIds'] = { $elemMatch: { '$eq': new ObjectId(this.loggedUser._id) } };




        //Skip Stage
        let skipST: any = { $match: {} };

        //Get  Posts Generated Before Last  Post Date Selected 'For Paging'
        if (lastPostId != 'null')
            skipST["$match"] = { "generatedDate": { $lt: new ObjectId(lastPostId).getTimestamp() } };
        else
            lastPostId = null;
        //Project Stage
        let projectST: any = {
            $project: {
                _id: 1,
                title: 1,
                generatedDate: 1,
                landingPageId: true,
                urlsCount: { $size: "$urls" },

                counterLove: { $size: "$userLoveIds" },
                counterNotLove: { $size: "$userNotLoveIds" },
                counterFavorite: { $size: "$userFavoriteIds" },

                userCreated: {
                    userName: "$userCreated.userName",
                    displayName: { $ifNull: ["$userCreated.fullName", "$userCreated.userName"] },
                    picturePath: "$userCreated.picturePath",
                    isGoogelPicture: "$userCreated.isGoogelPicture",
                },
            }
        };

        //Aggregate Now
        this.db.collection(cols.posts).aggregate<PostModel>
            ([
                matchST,
                { $sort: { generatedDate: -1, } },
                skipST,
                { $limit: limit },
                { $lookup: { from: "users", localField: "userId", foreignField: "_id", as: "userCreated" } },
                {
                    $unwind: {
                        path: "$userCreated",
                        preserveNullAndEmptyArrays: true
                    }
                },
                projectST,
            ])
            .toArray().then(res => {
                //Check From Length
                if (res.length == 0) {
                    if (!lastPostId)//Check For First Time
                        return this.end_info(this.resource.iNotFoundAnyPost)
                    return this.end_info(this.resource.noMorePosts)
                }

                let secondDate: Date = DateTimeService.getDateNowManual;
                let dts = new DateTimeService();
                dts.resource = this.resource;
                dts.lanugageCode = this.languageCode;

                //Update User Created Picture Full Path And Post Date Time Since
                res.forEach(s => {
                    s.userCreated.picturePath = UserService.getUserPicturePath(s.userCreated),
                        s.generatedDateTimeSince = dts.getDateTimeSince(s.generatedDate, secondDate);

                })

                this.end_successfully(this.resource.successfully, res);
            }).catch(eror => this.catchError2(eror, this));
    }

    /**
     * Get Last Posts For Landing Page
     */
    getLastPosts() {
        let matchST: any = {
            $match: {
                isActive: true,
                isPublic: true
            }
        };

        //Project Stage
        let projectST: any = {
            $project: {
                _id: 1,
                title: 1,
                landingPageId: true,
                userCreated: {
                    userName: "$userCreated.userName",
                    displayName: { $ifNull: ["$userCreated.fullName", "$userCreated.userName"] },
                    picturePath: "$userCreated.picturePath",
                    isGoogelPicture: "$userCreated.isGoogelPicture",
                },
            }
        };


        this.db.collection(cols.posts).aggregate<PostModel>
            ([
                matchST,
                { $sort: { generatedDate: -1, } },
                { $limit: 5 },
                { $lookup: { from: "users", localField: "userId", foreignField: "_id", as: "userCreated" } },
                {
                    $unwind:
                    {
                        path: "$userCreated",
                        preserveNullAndEmptyArrays: true
                    }
                },
                projectST
            ])
            .toArray().then(res => {
                //Check From Length
                if (res.length == 0) {
                    return this.end_info(this.resource.iNotFoundAnyPost)
                }

                //Update User Created Picture Full Path
                res.forEach(s =>
                    s.userCreated.picturePath = UserService.getUserPicturePath(s.userCreated))


                this.end_successfully(this.resource.successfully, res);
            }).catch(eror => this.catchError2(eror, this));
    }

    /**
     * Get Posts Current User Love There
     */
    getPostsLoveThere(limit: number, lastPostId: string) {
        this.getPostsReactThere(limit, lastPostId, "postsLoveIds");
    }

    /**
     * Get Posts Current User Not Love There
    */
    getPostsNotLoveThere(limit: number, lastPostId: string) {
        this.getPostsReactThere(limit, lastPostId, "postsNotLoveIds");
    }

    /**
    * Get Posts Current User Favorite There
    */
    getPostsFavoriteThere(limit: number, lastPostId: string) {
        this.getPostsReactThere(limit, lastPostId, "postsFavoriteIds");
    }

    /**
     * Get Posts Fro Current User If React On It
     * @param limit 
     * @param lastPostId 
     */
    getPostsReactThere(limit: number, lastPostId: string, arrayOfReactName: string) {
        //Skip Stage
        let skipST: any = {
            $match: {
                "$post.isActive": true,
            }
        };

        //Get  Posts Generated Before Last  Post Date Selected 'For Paging'
        if (lastPostId && lastPostId != 'null' && lastPostId != 'undefined')
            skipST["$match"].generatedDate = { $lt: new ObjectId(lastPostId).getTimestamp() };

        this.db.collection(cols.users).aggregate<PostModel>([
            { $match: { _id: new ObjectId(this.loggedUser._id) } },
            { $lookup: { from: "posts", localField: arrayOfReactName, foreignField: "_id", as: "post" } },
            { $unwind: "$post" },
            { $sort: { generatedDate: -1 } },
            skipST,
            { $limit: limit },
            {
                $project: {
                    _id: "$post._id",
                    title: "$post.title",
                    generatedDate: "$post.generatedDate",
                    landingPageId: "$post.landingPageId",
                    counterLove: { $size: "$post.userLoveIds" },
                    counterNotLove: { $size: "$post.userNotLoveIds" },
                    counterFavorite: { $size: "$post.userFavoriteIds" },
                    userCreated: {
                        userName: "userName",
                        fullName: "fullName",
                        picturePath: "picturePath",
                        isGoogelPicture: "isGoogelPicture",
                    },
                }
            }
        ]).toArray().then(res => {
            //Check From Length
            if (res.length == 0) {
                if (!lastPostId)//Check For First Time
                    return this.end_info(this.resource.iNotFoundAnyPost)
                return this.end_info(this.resource.noMorePosts)
            }

            //Update User Created Picture Full Path
            res.forEach(s => s.userCreated.picturePath = UserService.getUserPicturePath(s.userCreated))

            this.end_successfully(this.resource.successfully, res);
        }).catch(error => this.catchError2(error, this));
    }

    /**
    * Current User Make Love
    * Remove Current User From Not Love Array In (Post And User Information Document)
    * Add Current User To Love Array In (Post And User Information Document)
    * @param id 
    */
    love(id: string) {
        this.db.collection(cols.posts).countDocuments({
            _id: new ObjectId(id),
            userLoveIds: new ObjectId(this.loggedUser._id)
        }).then(count => {
            if (count)
                return this.end_successfully(this.resource.loveSuccessfully)
            //Update Post
            this.db.collection(cols.posts).updateOne({ _id: new ObjectId(id) },
                {
                    //Add To Love Array
                    $push: { userLoveIds: new ObjectId(this.loggedUser._id) },
                    //Remove From Not Love Array
                    $pull: { userNotLoveIds: new ObjectId(this.loggedUser._id) }
                }).then(res => {
                    if (!res.matchedCount)
                        return this.end_failed(this.resource.postIsNotFound);
                    else if (!res.modifiedCount)
                        return this.end_successfully(this.resource.loveSuccessfully)

                    //Update User Information
                    this.db.collection(cols.users).updateOne({ _id: new ObjectId(this.loggedUser._id) }, {
                        //Add To Love Array
                        $push: { postsLoveIds: new ObjectId(id) },
                        //Remove From Not Love Array
                        $pull: { postsNotLoveIds: new ObjectId(id) }
                    });

                    return this.end_successfully(this.resource.loveSuccessfully)
                }).catch(err => this.catchError2(err, this));
        }).catch(err => this.catchError2(err, this));
    }

    /**
    * Current User Make Not Love
    * Remove Current User To Love Array In (Post And User Information Document)
    * Add Current User From Not Love Array  In (Post And User Information Document)
    * @param id 
    */
    notLove(id: string) {
        this.db.collection(cols.posts).countDocuments({
            _id: new ObjectId(id),
            userNotLoveIds: new ObjectId(this.loggedUser._id)
        }).then(count => {
            if (count)
                return this.end_successfully(this.resource.unLoveSuccessfully)
            //Update Post
            this.db.collection(cols.posts).updateOne({ _id: new ObjectId(id) },
                {
                    //Add To Not Love Array
                    $push: { userNotLoveIds: new ObjectId(this.loggedUser._id) },
                    //Remove From Love Array
                    $pull: { userLoveIds: new ObjectId(this.loggedUser._id) }
                }).then(res => {
                    if (!res.matchedCount)
                        return this.end_failed(this.resource.postIsNotFound);

                    //Update User Information
                    this.db.collection(cols.users).updateOne({ _id: new ObjectId(this.loggedUser._id) }, {
                        //Add To Not Love Array
                        $push: { postsNotLoveIds: new ObjectId(id) },
                        //Remove From Love Array
                        $pull: { postsLoveIds: new ObjectId(id) }
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
        let shortQuery = {}, userQuery = {};
        this.db.collection(cols.posts).countDocuments({
            _id: new ObjectId(id),
            userFavoriteIds: new ObjectId(this.loggedUser._id)
        }).then(count => {

            //Check If Favorite 
            if (count) {
                //Un-Favorite
                shortQuery = { $pull: { userFavoriteIds: new ObjectId(this.loggedUser._id) } };
                userQuery = { $pull: { postsFavoriteIds: new ObjectId(id) } }
            }
            else {
                //Favorite
                shortQuery = { $push: { userFavoriteIds: new ObjectId(this.loggedUser._id) } };
                userQuery = { $push: { postsFavoriteIds: new ObjectId(id) } }
            }
            //Update Post
            this.db.collection(cols.posts).updateOne({ _id: new ObjectId(id) }, shortQuery).then(res => {
                if (!res.matchedCount)
                    return this.end_failed(this.resource.postIsNotFound);
                else if (!res.modifiedCount)
                    return this.end_successfully(count ? this.resource.unFavoriteSuccessfully : this.resource.favoriteSuccessfully)

                //Update User Information
                this.db.collection(cols.users).updateOne({ _id: new ObjectId(this.loggedUser._id) }, userQuery);

                return this.end_successfully(count ? this.resource.unFavoriteSuccessfully : this.resource.favoriteSuccessfully)
            }).catch(err => this.catchError2(err, this));
        }).catch(err => this.catchError2(err, this));

    }


    /**
    * Get Dashbord Information For Current User
    */
    dashbordInfo() {
        this.db.collection(cols.posts).find<PostModel>({ userId: new ObjectId(this.loggedUser._id) }, { fields: ['isActive', 'isPublic'] }).toArray()
            .then(res => {
                let dash = new DashbordInformation();
                dash.numberOfPosts = res.length;
                dash.numberOfPostsActive = res.filter(v => v.isActive).length;
                dash.numberOfPostsNotActive = res.filter(v => !v.isActive).length;
                dash.numberOfPostsPublic = res.filter(v => v.isPublic).length;
                dash.numberOfPostsPrivate = res.filter(v => !v.isPublic).length;
                this.end_successfully(this.resource.successfully);
            }).catch(erroe => this.catchError2(erroe, this));

    }

    /**
     * Fill Advertisement 
     * @param a 
     */
    fillAdvertisement(a: PostAdvertisemetnModel): PostAdvertisemetnModel {
        return {
            advertiseingNetworkType: a.advertiseingNetworkType,
            adsense_pub: a.adsense_pub,
            adsense_slot: a.adsense_slot
        };
    }

    /**
     * Fill Seo 
     * @param s 
     */
    fillSeo(s: PostSeoModel): PostSeoModel {
        return {
            title: s.title,
            description: s.description,
            keywords: s.keywords
        };
    }

}//End Class