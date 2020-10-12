import express, { Request, Response, Router } from 'express';
import { BasicModule } from "./basic.module";
import { cols } from '../consts/collections.conse';
import { PostModel } from '../models/post.model';
import { ObjectId } from 'mongodb';
import { config } from '../consts/congif.const';
import { DashbordInformation } from '../models/dashbord.information';
import { UserModel } from '../models/user.model';
import { FileService } from '../services/file.services';
import * as formidable from "formidable";
import * as fs from "fs";
import * as path from "path";
import { json, text } from 'body-parser';
import { UserService } from '../services/user.service';
import { DateTimeService } from '../services/date.time.service';
import { SEOModel } from '../models/seo.model';
import { VistorModel } from '../models/vistor.model';
import { Socket } from 'dgram';
import { SocketIOService } from '../services/socket.io.service';
import { SocketIOEvents } from '../consts/socket.io.events.const';
import { ISocketResponse } from '../interfaces/i.socket.response';
import { ActionModel } from '../models/action.model';
import { runInThisContext } from 'vm';
import * as  geoip from "geoip-lite";

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

            post.pureContent = post.content.replace(/([^<]*>|<)/gmi, '')

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
                    $push: { posts: { _id: post._id } }
                });

            //Pass Post Now By Socket To All Language Pages Opne
            SocketIOService.sendNewPostPublish(post.languageCode, <ISocketResponse>{
                newPost: post
            });

            //Return Success Now
            this.end_successfully(this.resource.postCreatedSuccessfully, { landingPageId: post.landingPageId });
        }).catch(this.catchError);
    }



    /**
     * Update Post
     * @param post 
     */
    async update() {
        let form = new formidable.IncomingForm();
        let post: PostModel;

        form.parse(this.req, async (formParseError, fields, files) => {
            //Return Error I Icant Saved Image
            if (formParseError)
                return this.end_failed(this.resource.iCouldNotSavePostImage);

            //Parse Json To Object Now
            post = JSON.parse(fields["postInfo"].toString());

            post.pureContent = post.content.replace(/([^<]*>|<)/gmi, '')
            post.content = post.content.replace(/\"/gm, "'");

            //Check If Saved Post Have A Image
            if (files.image) {
                //Rename Post Image To Append Landing Page Id To Path
                post.photoPath = `/files/posts/${post.landingPageId}_${files.image.name.replace(/ /gm, '')}`;
                fs.rename(files.image.path, path.join(__dirname, '..', post.photoPath), renamePostImageError => {
                    //Return Error I Cound Not Rename
                    if (renamePostImageError)
                        return this.end_failed(this.resource.iCouldNotSavePostImage);
                    this.updatePost(post, true, true);
                });
            } else {
                this.updatePost(post, post.imageDeleted);
            }
        });
    }

    /**
     * Update Post Now In DataBase
     * @param post 
     * @param ifUpdateingImage 
     */

    private updatePost(post: PostModel, ifDeleteOldImage: boolean, ifNewImage: boolean = false) {
        this.db.collection(cols.posts).findOne<PostModel>({ _id: new ObjectId(post._id), userId: new ObjectId(this.loggedUser._id) }).then(po => {
            if (!po) {
                //Remove Old Image Affter Saved
                if (ifNewImage)
                    FileService.removeFiles(post.photoPath);
                return this.end_failed(this.resource.postIsNotFound);
            }


            post.photoPath = ifNewImage ? post.photoPath : ifDeleteOldImage ? null : po.photoPath;
            this.db.collection(cols.posts).updateOne({ _id: new ObjectId(post._id) }, {
                $set: {
                    title: post.title,
                    content: post.content,
                    pureContent: post.pureContent,
                    urls: post.urls,
                    isActive: post.isActive,
                    isPublic: post.isPublic,
                    photoPath: post.photoPath,
                    languageCode: post.languageCode,
                }
            }).then(res => {
                //Remove New Image Saved
                if (ifDeleteOldImage)
                    FileService.removeFiles(po.photoPath);
                return this.end_successfully(this.resource.postUpdatedSuccessfully);
            }).catch(eror => {
                //Remove New Image Saved
                if (ifNewImage)
                    FileService.removeFiles(post.photoPath);
                this.catchError2(eror, this)
            });
        }).catch(eror => {
            this.catchError2(eror, this)
            //Remove New Image Saved
            if (ifNewImage)
                FileService.removeFiles(post.photoPath);
        });

    }

    /**
    *  If post has vistors i will do th flowing
    *	-remove all details form post document without title and vistors 
    *	-in user document in postsids with this post id i will update "isDeleted" property to ture
    * If post not has any vistors i will do th flowing
    *	-delete post document from collection
    *	-delete post id from user postsids in post document
     * @param id 
     */
    delete(id: string): void {
        this.db.collection(cols.posts).findOne<PostModel>({ _id: new ObjectId(id), userId: new ObjectId(this.loggedUser._id) })
            .then(post => {
                if (!post)
                    return this.end_failed(this.resource.postIsNotFound);


                if (post.vistors?.length) {
                    console.log('deletePostDetials');
                    this.deletePostDetials(post);
                } else {
                    console.log('deletePostDocument');
                    this.deletePostDocument(post);
                }
            }).catch(err => this.catchError(err));
    }

    /**
    *- If post not has any vistors i will do th flowing
    *-delete post document from collection
    *-delete post image from server
    *-delete post id from user postsids in post document
    *-delete post id from array love or nolove or favorite from all users
     * @param id 
     */
    private deletePostDocument(post: PostModel): void {
        //Delete post document from collection
        this.db.collection(cols.posts).deleteOne({ _id: new ObjectId(post._id), userId: new ObjectId(this.loggedUser._id) }).then(res => {
            if (!res.deletedCount)
                return this.end_failed(this.resource.iCantDeleteThePost);

            //Delete post id from user postsids in post document
            this.db.collection(cols.users).updateOne({ _id: new ObjectId(this.loggedUser._id) }, {
                $pull: { "posts._id": new ObjectId(post._id) }
            });
            //Delete post id from array love or nolove or favorite from all users
            this.db.collection(cols.users).updateOne({}, {
                $pull: { "postsLoveIds": new ObjectId(post._id), "postsNotLoveIds": new ObjectId(post._id), "postsFavoriteIds": new ObjectId(post._id) }
            });

            //Remove Post Image From Server Now
            FileService.removeFiles(post.photoPath);
            return this.end_successfully(this.resource.deleted);
        }).catch(err => this.catchError2(err, this));
    }

    /**
     * -remove all details form post document without title and vistors 
     * -delete post image from server
     * -in user document in postsids with this post id i will update "isDeleted" property to ture
     * -delete post id from array love or nolove or favorite from all users
     * @param id 
     */
    private deletePostDetials(post: PostModel): void {

        this.db.collection(cols.posts).updateOne({ _id: new ObjectId(post._id), userId: new ObjectId(this.loggedUser._id) },
            {
                $set: {
                    isDeleted: true
                },
                $unset: {
                    content: true,
                    languageCode: true,
                    photoPath: true,
                    seo: true,
                    urls: true,
                    userLoveIds: true,
                    userNotLoveIds: true,
                    userFavoriteIds: true,
                    pureContent: true
                }
            }).then(res => {
                if (!res.modifiedCount)
                    this.end_failed(this.resource.iCantDeleteThePost);


                //In user document in postsids with this post id i will update "isDeleted" property to ture
                this.db.collection(cols.users).updateOne({ _id: new ObjectId(this.loggedUser._id) }, {
                    $set: { "posts.$[v].isDeleted": true }
                },
                    { arrayFilters: [{ "v._id": new ObjectId(post._id) }] }
                );

                //Delete post id from array love or nolove or favorite from all users
                this.db.collection(cols.users).updateOne({}, {
                    $pull: { "postsLoveIds": new ObjectId(post._id), "postsNotLoveIds": new ObjectId(post._id), "postsFavoriteIds": new ObjectId(post._id) }
                });

                //Remove Post Image From Server Now
                FileService.removeFiles(post.photoPath);
                return this.end_successfully(this.resource.deleted);

            }).catch(err => this.catchError2(err, this));
    }

    /**
     *  Get Posts For Logged User
     */
    getMyPosts(skip: number, limit: number, filter: PostModel) {

        //Filter stage
        let postFilter: any = { $match: { "post.isDeleted": { $in: [false, undefined] } } };

        postFilter["$match"]["post.isActive"] = filter.isActive.toString() == 'true' ? true : false;
        postFilter["$match"]["post.isPublic"] = filter.isPublic.toString() == 'true' ? true : false;
        if (filter.languageCode && filter.languageCode != 'null') postFilter["$match"]["post.languageCode"] = filter.languageCode;
        if (filter.url) postFilter["$match"]["post.urls"] = { $in: [new RegExp(filter.url, 'im')] };
        if (filter.title) postFilter["$match"]["post.title"] = { "$regex": filter.title, "$options": "igm" };
        if (filter.content) postFilter["$match"]["post.pureContent"] = { "$regex": filter.content, "$options": "im" };



        this.db.collection(cols.users).aggregate<PostModel>
            ([
                { $match: { _id: new ObjectId(this.loggedUser._id) } },
                { $lookup: { from: "posts", localField: "posts._id", foreignField: "_id", as: "post" } },
                {
                    $unwind: "$post"
                },
                postFilter,
                { $sort: { "post.generatedDate": -1, } },
                { $skip: skip },
                { $limit: limit },
                {
                    $project: {
                        _id: "$post._id",
                        title: "$post.title",
                        generatedDate: "$post.generatedDate",
                        languageCode: "$post.languageCode",
                        isActive: "$post.isActive",
                        isPublic: "$post.isPublic",
                        urlsCount: { $size: "$post.urls" },
                        counterLove: { $size: "$post.userLoveIds" },
                        counterNotLove: { $size: "$post.userNotLoveIds" },
                        counterFavorite: { $size: "$post.userFavoriteIds" },
                        landingPageUrl: { $concat: [config.websiteUrl, "/_", "$post.landingPageId"] },
                        landingPageId: "$post.landingPageId"
                    }
                }
            ])
            .toArray().then(res => {
                //Check From Length
                if (res.length == 0) {
                    //Check For First Time
                    if (skip == 0)
                        return this.end_info(this.resource.noPostsFound)
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
     * Get Post Details 
     * @param landingPageId 
     */
    getPostDetails(landingPageId: string) {
        if (!landingPageId)
            return this.end_failed(this.resource.postIsNotFound);
        let loggedUserId = this.loggedUser?._id;
        this.db.collection(cols.posts).aggregate<PostModel>(
            [
                { $match: { landingPageId: landingPageId, isDeleted: { $in: [false, undefined] }, isActive: true } },
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
                        seo: 1,
                        languageCode: 1,
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

                var geo = geoip.lookup(this.req.ip);

                post.currentVistor = {
                    _id: new ObjectId(), isMakeActivityWithPost: false,
                    ip: this.req.ip,
                    countryCode: geo.country,
                    loggedUserId: this.loggedUser._id ? new ObjectId(this.loggedUser._id) : null
                } ;

                //Push New Vistor To Post Vistors Arrays
                this.db.collection(cols.posts).updateOne({ _id: new ObjectId(post._id) }, {
                    $push: {
                        vistors: post.currentVistor
                    }
                }).then(re => {
                }).catch(err => { });

                //Pass Id Only
                post.currentVistor = { _id: post.currentVistor._id } as VistorModel;
                this.end_successfully(this.resource.successfully, post);
            }).catch(err => this.catchError2(err, this));
    }


    /**
     * Get Post Detials For Edit
     * @param landingPageId 
     */
    getPostDetailsForEdit(landingPageId: string): void {

        this.db.collection(cols.posts).findOne<PostModel>({ landingPageId: landingPageId, userId: new ObjectId(this.loggedUser._id) },
            {
                fields: {
                    title: true,
                    content: true,
                    urls: true,
                    isActive: true,
                    isPublic: true,
                    photoPath: true,
                    languageCode: true,
                }
            })
            .then(post => {
                if (!post)
                    return this.end_failed(this.resource.postIsNotFound);
                post.photoPath = post.photoPath ? (config.apiFullPath + post.photoPath) : null;

                return this.end_successfully(this.resource.successfully, post);
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
                isDeleted: { $in: [false, undefined] },
                isActive: true,
                isPublic: true,
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
        let loggedUserId = this.loggedUser?._id, projectST: any = {
            $project: {
                _id: 1,
                title: 1,
                generatedDate: 1,
                landingPageId: true,
                urlsCount: { $size: "$urls" },
                counterLove: { $size: "$userLoveIds" },
                counterNotLove: { $size: "$userNotLoveIds" },
                counterFavorite: { $size: "$userFavoriteIds" },
                isCurrentUserLoved: { $in: [new ObjectId(loggedUserId), "$userLoveIds"] },
                isCurrentUserNotLoved: { $in: [new ObjectId(loggedUserId), "$userNotLoveIds"] },
                isCurrentUserFavorited: { $in: [new ObjectId(loggedUserId), "$userFavoriteIds"] },

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
     * @param languageCode Language Code Target
     */
    getLastPosts(languageCode: string) {
        let matchST: any = {
            $match: {
                languageCode: languageCode,
                isActive: true,
                isPublic: true,
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
                    $pull: { userNotLoveIds: new ObjectId(this.loggedUser._id) },
                }).then(res => {
                    if (!res.matchedCount)
                        return this.end_failed(this.resource.postIsNotFound);
                    else if (!res.modifiedCount)
                        return this.end_successfully(this.resource.loveSuccessfully)



                    //Update User Information
                    this.db.collection(cols.users).updateOne({ _id: new ObjectId(this.loggedUser._id) }, {
                        //Add To Love Array
                        $push: { postsLoveIds: <ActionModel>{ actionDate: DateTimeService.getDateNowManual, targetId: new ObjectId(id) } },
                        //Remove From Not Love Array
                        $pull: { postsNotLoveIds: { targetId: new ObjectId(id) } }
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
                    $pull: { userLoveIds: new ObjectId(this.loggedUser._id) },
                }).then(res => {
                    if (!res.matchedCount)
                        return this.end_failed(this.resource.postIsNotFound);

                    //Update User Information
                    this.db.collection(cols.users).updateOne({ _id: new ObjectId(this.loggedUser._id) }, {
                        //Add To Not Love Array
                        $push: { postsNotLoveIds: <ActionModel>{ actionDate: DateTimeService.getDateNowManual, targetId: new ObjectId(id) } },
                        //Remove From Love Array
                        $pull: { postsLoveIds: { targetId: new ObjectId(id) } }
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
                shortQuery = {
                    $pull: { userFavoriteIds: new ObjectId(this.loggedUser._id) },
                };
                userQuery = { $pull: { postsFavoriteIds: { targetId: new ObjectId(id) } } }
            }
            else {
                //Favorite
                shortQuery = {
                    $push: { userFavoriteIds: new ObjectId(this.loggedUser._id) },
                };
                userQuery = { $push: { postsFavoriteIds: { actionDate: DateTimeService.getDateNowManual, targetId: new ObjectId(id) } } }
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
     * Update Post Vistor To Activity And Save Vistor Information
     * @param postId 
     * @param vistorId 
     */
    updatePostVistorToActivity(postId: string, vistorId: string): void {
        this.db.collection(cols.posts).updateOne({ _id: new ObjectId(postId) }, {
            $set: { "vistors.$[v].isMakeActivityWithPost": true }
        },
            { arrayFilters: [{ "v._id": new ObjectId(vistorId) }] }
        ).then(res => {
            if (!res.modifiedCount)
                return this.end_failed(this.resource.someErrorHasBeen);
            return this.end_successfully(this.resource.successfully);
        }).catch(err => this.catchError2(err, this));
    }


    /**
    * Get Dashbord Information For Current User
    */
    dashbordInfo() {
        this.db.collection(cols.posts).find<PostModel>({ userId: new ObjectId(this.loggedUser._id) }, { fields: { isActive: true, isPublic: true } }).toArray()
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
      * Get Posts Current User Loved
      */
    getPostsActivities(skip: number, limit: number, isLovedVideos: boolean, isNotLovedVideos: boolean = false, isFavoriteVideos: boolean = false) {
        let localFieldTarget: string, unwindFoeldTarget: string;
        let sortStage: any = {};

        if (isLovedVideos) {
            localFieldTarget = "postsLoveIds";
            sortStage = { $sort: { "postsLoveIds.actionDate": -1 } };
        }
        else if (isNotLovedVideos) {
            localFieldTarget = "postsNotLoveIds";
            sortStage = { $sort: { "postsNotLoveIds.actionDate": -1 } };
        }
        else if (isFavoriteVideos) {
            localFieldTarget = "postsFavoriteIds";
            sortStage = { $sort: { "postsFavoriteIds.actionDate": -1 } };
        }

        unwindFoeldTarget = "$" + localFieldTarget;
        localFieldTarget = localFieldTarget + ".targetId";

        this.db.collection(cols.users).aggregate<PostModel>([
            { $match: { "_id": new ObjectId(this.loggedUser._id) } },
            { $unwind: "$" + localFieldTarget },
            { $lookup: { from: "posts", localField: localFieldTarget, foreignField: "_id", as: "post" } },
            { $unwind: "$post" },
            sortStage,
            { $skip: skip, },
            { $limit: limit },
            {
                $project: {
                    _id: "$post._id",
                    landingPageId: "$post.landingPageId",
                    title: "$post.title",
                    counterViews: "$post.counterViews",
                    counterLove: { $size: "$post.userLoveIds" },
                    counterNotLove: { $size: "$post.userNotLoveIds" },
                    counterFavorite: { $size: "$post.userFavoriteIds" },
                    landingPageUrl: { $concat: [config.websiteUrl, "/_", "$post.landingPageId"] }
                }
            }
        ]).toArray((error, arr) => {
            if (error)
                return this.end_failed(this.resource.someErrorHasBeen, error);

            if (arr.length == 0)
                if (skip == 0)
                    return this.end_info(this.resource.noPostsFound, true)
                else
                    return this.end_info(this.resource.noMorePosts, true)
            return this.end_successfully(this.resource.successfully, arr);
        });
    }

    /** Current User Remove Love    */
    removeActivityLove(id: string) {

        //Remove User Id From Post Loves Arry
        this.db.collection(cols.posts).updateOne({ _id: new ObjectId(id) }, {
            $pull: { "userLoveIds": new ObjectId(this.loggedUser._id) }
        }).then(res => {

            //Remove Post Id From Uswer Posts Love Arry
            this.db.collection(cols.users).updateOne({ _id: new ObjectId(this.loggedUser._id) }, {
                $pull: { "postsLoveIds": { targetId: new ObjectId(id) } }
            });
            return this.end_successfully(this.resource.removedPostFromLoveList);
        }).catch(c => this.catchError(c));
    }

    /** Current User Remove Not Love    */
    removeActivityNotLove(id: string): void {
        //Remove User Id From Post Not Loves Arry
        this.db.collection(cols.posts).updateOne({ _id: new ObjectId(id) }, {
            $pull: { "userNotLoveIds": new ObjectId(this.loggedUser._id) }
        }).then(res => {

            //Remove Post Id From User Posts Not Love Arry
            this.db.collection(cols.users).updateOne({ _id: new ObjectId(this.loggedUser._id) }, {
                $pull: { "postsNotLoveIds": { targetId: new ObjectId(id) } }
            });
            return this.end_successfully(this.resource.removedPostFromNotLoveList);
        }).catch(c => this.catchError(c));
    }

    /** Current User Remove Favorite   */
    removeActivityFavorite(id: string): void {
        //Remove User Id From Post Favorites Arry
        this.db.collection(cols.posts).updateOne({ _id: new ObjectId(id) }, {
            $pull: { "userFavoriteIds": new ObjectId(this.loggedUser._id) }
        }).then(res => {

            //Remove Post Id From User Posts Favorite Arry
            this.db.collection(cols.users).updateOne({ _id: new ObjectId(this.loggedUser._id) }, {
                $pull: {
                    "postsFavoriteIds": { targetId: new ObjectId(id) }
                }
            });
            return this.end_successfully(this.resource.removedPostFromFavoriteList);
        }).catch(c => this.catchError(c));
    }

    /** Get Post Activities Anlysis   */

    getPostsActivitiesAnlysis(landingPostId: string): void {
        this.db.collection(cols.posts).aggregate<PostModel>(
            [{ $match: { landingPageId: landingPostId, userId: new ObjectId(this.loggedUser._id) } },
            {
                $project: {
                    counterLove: { $size: "$userLoveIds" },
                    counterNotLove: { $size: "$userNotLoveIds" },
                    counterFavorite: { $size: "$userFavoriteIds" }
                }
            }]).toArray().then(posts => {
                if (!posts.length) return this.end_failed(this.resource.postIsNotFound);
                return this.end_successfully(this.resource.successfully, posts[0]);
            }).catch(c => this.catchError(c));

    }

}//End Class