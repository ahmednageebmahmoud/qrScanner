"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
exports.PostModule = void 0;
const basic_module_1 = require("./basic.module");
const collections_conse_1 = require("../consts/collections.conse");
const mongodb_1 = require("mongodb");
const congif_const_1 = require("../consts/congif.const");
const dashbord_information_1 = require("../models/dashbord.information");
const file_services_1 = require("../services/file.services");
const formidable = __importStar(require("formidable"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const user_service_1 = require("../services/user.service");
const date_time_service_1 = require("../services/date.time.service");
const socket_io_service_1 = require("../services/socket.io.service");
class PostModule extends basic_module_1.BasicModule {
    /**
     * new Post Id
     */
    get newPostId() { return Math.random().toString(36).substr(2, 9); }
    ;
    constructor(rrq, rrs) {
        super(rrq, rrs);
    }
    /**
     * Create New Post
     * @param post
     */
    create() {
        return __awaiter(this, void 0, void 0, function* () {
            let form = new formidable.IncomingForm();
            let post;
            form.parse(this.req, (formParseError, fields, files) => __awaiter(this, void 0, void 0, function* () {
                //Return Error I Icant Saved Image
                if (formParseError)
                    return this.end_failed(this.resource.iCouldNotSavePostImage);
                //Parse Json To Object Now
                post = JSON.parse(fields["postInfo"].toString());
                //Generate New Landing Id
                post.landingPageId = yield this.generateNewId(this.newPostId);
                post.pureContent = post.content.replace(/([^<]*>|<)/gmi, '');
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
                }
                else {
                    this.createPost(post);
                }
            }));
        });
    }
    /**
     * Create Post In DataBase
     * @param post
     */
    createPost(post) {
        //Add Another Post Information
        post.userId = new mongodb_1.ObjectId(this.loggedUser._id);
        post.userName = this.loggedUser.userName;
        post.generatedDate = date_time_service_1.DateTimeService.getDateNowManual;
        post.content = post.content.replace(/\"/gm, "'");
        post.userLoveIds = []; //Add Defult For Check If Array Whwn Aggregate
        post.userNotLoveIds = [];
        post.userFavoriteIds = [];
        //Create New Document Now
        this.db.collection(collections_conse_1.cols.posts).insertOne(post).then(res => {
            var _a;
            if (!res.insertedId)
                return this.end_failed(this.resource.iCouldNotCreateNewPost);
            //Add Id To Current User Document
            if ((_a = this.loggedUser) === null || _a === void 0 ? void 0 : _a._id)
                this.db.collection(collections_conse_1.cols.users).updateOne({ _id: new mongodb_1.ObjectId(this.loggedUser._id) }, {
                    $push: { posts: { _id: post._id } }
                });
            //Pass Post Now By Socket To All Language Pages Opne
            socket_io_service_1.SocketIOService.sendNewPostPublish(post.languageCode, {
                newPost: post
            });
            //Return Success Now
            this.end_successfully(this.resource.postCreatedSuccessfully, { landingPageId: post.landingPageId });
        }).catch(this.catchError);
    }
    /**
     *
     * Update Post
     * @param sho
     */
    update(post) {
        if (!(post === null || post === void 0 ? void 0 : post._id))
            return this.end_failed(this.resource.idIsNotFound);
        //Save Pst Image If Passed New
        // if (post.newImage) {
        //     post.photoPath = FileService.saveFileSync(post.newImage, "post");
        //     if (!post.photoPath)
        //         return this.end_failed(this.resource.iCouldNotSaveNewPicture);
        // }
        this.db.collection(collections_conse_1.cols.posts).updateOne({ _id: new mongodb_1.ObjectId(post._id), userId: new mongodb_1.ObjectId(this.loggedUser._id) }, {
            $set: {
                title: post.title,
                content: post.content,
                pureContent: post.content.replace(/([^<]*>|<)/gmi, ''),
                isActive: post.isActive,
                isPublic: post.isPublic,
                urls: post.urls,
                advertisement: this.fillAdvertisement(post.advertisement),
                seo: post.seo
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
    *  If post has vistors i will do th flowing
    *	-remove all details form post document without title and vistors
    *	-in user document in postsids with this post id i will update "isDeleted" property to ture
    * If post not has any vistors i will do th flowing
    *	-delete post document from collection
    *	-delete post id from user postsids in post document
     * @param id
     */
    delete(id) {
        this.db.collection(collections_conse_1.cols.posts).findOne({ _id: new mongodb_1.ObjectId(id), userId: new mongodb_1.ObjectId(this.loggedUser._id) })
            .then(post => {
            var _a, _b;
            if (!post)
                return this.end_failed(this.resource.postIsNotFound);
            console.log((_a = post.vistors) === null || _a === void 0 ? void 0 : _a.length);
            console.log(post.vistors);
            if ((_b = post.vistors) === null || _b === void 0 ? void 0 : _b.length) {
                console.log('deletePostDetials');
                this.deletePostDetials(post);
            }
            else {
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
    deletePostDocument(post) {
        //Delete post document from collection
        this.db.collection(collections_conse_1.cols.posts).deleteOne({ _id: new mongodb_1.ObjectId(post._id), userId: new mongodb_1.ObjectId(this.loggedUser._id) }).then(res => {
            if (!res.deletedCount)
                return this.end_failed(this.resource.iCantDeleteThePost);
            //Delete post id from user postsids in post document
            this.db.collection(collections_conse_1.cols.users).updateOne({ _id: new mongodb_1.ObjectId(this.loggedUser._id) }, {
                $pull: { "posts._id": new mongodb_1.ObjectId(post._id) }
            });
            //Delete post id from array love or nolove or favorite from all users
            this.db.collection(collections_conse_1.cols.users).updateOne({}, {
                $pull: { "postsLoveIds": new mongodb_1.ObjectId(post._id), "postsNotLoveIds": new mongodb_1.ObjectId(post._id), "postsFavoriteIds": new mongodb_1.ObjectId(post._id) }
            });
            //Remove Post Image From Server Now
            file_services_1.FileService.removeFiles(post.photoPath);
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
    deletePostDetials(post) {
        this.db.collection(collections_conse_1.cols.posts).updateOne({ _id: new mongodb_1.ObjectId(post._id), userId: new mongodb_1.ObjectId(this.loggedUser._id) }, {
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
            this.db.collection(collections_conse_1.cols.users).updateOne({ _id: new mongodb_1.ObjectId(this.loggedUser._id) }, {
                $set: { "posts.$[v].isDeleted": true }
            }, { arrayFilters: [{ "v._id": new mongodb_1.ObjectId(post._id) }] });
            //Delete post id from array love or nolove or favorite from all users
            this.db.collection(collections_conse_1.cols.users).updateOne({}, {
                $pull: { "postsLoveIds": new mongodb_1.ObjectId(post._id), "postsNotLoveIds": new mongodb_1.ObjectId(post._id), "postsFavoriteIds": new mongodb_1.ObjectId(post._id) }
            });
            //Remove Post Image From Server Now
            file_services_1.FileService.removeFiles(post.photoPath);
            return this.end_successfully(this.resource.deleted);
        }).catch(err => this.catchError2(err, this));
    }
    /**
     *  Get Posts For Logged User
     */
    getMyPosts(skip, limit, filter) {
        //Filter stage
        let postFilter = { $match: { "post.isDeleted": { $in: [false, undefined] } } };
        postFilter["$match"]["post.isActive"] = filter.isActive.toString() == 'true' ? true : false;
        postFilter["$match"]["post.isPublic"] = filter.isPublic.toString() == 'true' ? true : false;
        if (filter.languageCode && filter.languageCode != 'null')
            postFilter["$match"]["post.languageCode"] = filter.languageCode;
        if (filter.url)
            postFilter["$match"]["post.urls"] = { $in: [new RegExp(filter.url, 'im')] };
        if (filter.title)
            postFilter["$match"]["post.title"] = { "$regex": filter.title, "$options": "igm" };
        if (filter.content)
            postFilter["$match"]["post.pureContent"] = { "$regex": filter.content, "$options": "im" };
        this.db.collection(collections_conse_1.cols.users).aggregate([
            { $match: { _id: new mongodb_1.ObjectId(this.loggedUser._id) } },
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
                    landingPageUrl: { $concat: [congif_const_1.config.websiteUrl, "/_", "$post.landingPageId"] }
                }
            }
        ])
            .toArray().then(res => {
            //Check From Length
            if (res.length == 0) {
                //Check For First Time
                if (skip == 0)
                    return this.end_info(this.resource.noPostsFound);
                return this.end_info(this.resource.noMorePosts);
            }
            this.end_successfully(this.resource.successfully, res);
        }).catch(eror => this.catchError2(eror, this));
    }
    /**
     * Generate Post Id For Shortn
     */
    generateNewId(id) {
        return __awaiter(this, void 0, void 0, function* () {
            //Check If Dublicate
            if ((yield this.db.collection(collections_conse_1.cols.posts).countDocuments({ landingPageId: id })) == 0)
                return id;
            return yield this.generateNewId(this.newPostId);
        });
    }
    /**
     *
     * @param isApplyOnLastPosts For Append This Setting On ALl Last Posts
     * @param setting New Setting
     */
    updateDefultSetting(isApplyOnLastPosts, setting) {
        //Update Now
        this.db.collection(collections_conse_1.cols.users).updateOne({ _id: new mongodb_1.ObjectId(this.loggedUser._id) }, {
            $set: {
                postDefaultSettings: {
                    advertisement: this.fillAdvertisement(setting.advertisement),
                    isPublic: setting.isPublic,
                }
            }
        }).then(up => {
            //Updatet All Last Posts
            if (!isApplyOnLastPosts)
                return this.end_successfully(this.resource.updated);
            this.db.collection(collections_conse_1.cols.posts).updateMany({ userId: new mongodb_1.ObjectId(this.loggedUser._id) }, {
                $set: {
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
    getPostDetails(landingPageId) {
        var _a;
        if (!landingPageId)
            return this.end_failed(this.resource.postIsNotFound);
        let loggedUserId = (_a = this.loggedUser) === null || _a === void 0 ? void 0 : _a._id;
        this.db.collection(collections_conse_1.cols.posts).aggregate([
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
                    isCurrentUserLoved: { $in: [new mongodb_1.ObjectId(loggedUserId), "$userLoveIds"] },
                    isCurrentUserNotLoved: { $in: [new mongodb_1.ObjectId(loggedUserId), "$userNotLoveIds"] },
                    isCurrentUserFavorited: { $in: [new mongodb_1.ObjectId(loggedUserId), "$userFavoriteIds"] },
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
            if (!post)
                return this.end_failed(this.resource.postIsNotFound);
            post.photoPath = post.photoPath ? (congif_const_1.config.apiFullPath + post.photoPath) : null;
            //Update User Picture Path
            post.userCreated.picturePath = user_service_1.UserService.getUserPicturePath(post.userCreated);
            post.currentVistor = { _id: new mongodb_1.ObjectId(), isMakeActivityWithPost: false };
            //Push New Vistor To Post Vistors Arrays
            this.db.collection(collections_conse_1.cols.posts).updateOne({ _id: new mongodb_1.ObjectId(post._id) }, {
                $push: {
                    vistors: post.currentVistor
                }
            }).then(re => {
                this.end_successfully(this.resource.successfully, post);
            }).catch(err => this.catchError2(err, this));
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
    getPosts(limit, lastPostId, postLanguageCode, currentUserAction, createdUserName) {
        var _a;
        let matchST = {
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
            matchST['$match']['userLoveIds'] = { $elemMatch: { '$eq': new mongodb_1.ObjectId(this.loggedUser._id) } };
        else if (currentUserAction == "notLove")
            matchST['$match']['userNotLoveIds'] = { $elemMatch: { '$eq': new mongodb_1.ObjectId(this.loggedUser._id) } };
        else if (currentUserAction == "favorite")
            matchST['$match']['userFavoriteIds'] = { $elemMatch: { '$eq': new mongodb_1.ObjectId(this.loggedUser._id) } };
        //Skip Stage
        let skipST = { $match: {} };
        //Get  Posts Generated Before Last  Post Date Selected 'For Paging'
        if (lastPostId != 'null')
            skipST["$match"] = { "generatedDate": { $lt: new mongodb_1.ObjectId(lastPostId).getTimestamp() } };
        else
            lastPostId = null;
        //Project Stage
        let loggedUserId = (_a = this.loggedUser) === null || _a === void 0 ? void 0 : _a._id, projectST = {
            $project: {
                _id: 1,
                title: 1,
                generatedDate: 1,
                landingPageId: true,
                urlsCount: { $size: "$urls" },
                counterLove: { $size: "$userLoveIds" },
                counterNotLove: { $size: "$userNotLoveIds" },
                counterFavorite: { $size: "$userFavoriteIds" },
                isCurrentUserLoved: { $in: [new mongodb_1.ObjectId(loggedUserId), "$userLoveIds"] },
                isCurrentUserNotLoved: { $in: [new mongodb_1.ObjectId(loggedUserId), "$userNotLoveIds"] },
                isCurrentUserFavorited: { $in: [new mongodb_1.ObjectId(loggedUserId), "$userFavoriteIds"] },
                userCreated: {
                    userName: "$userCreated.userName",
                    displayName: { $ifNull: ["$userCreated.fullName", "$userCreated.userName"] },
                    picturePath: "$userCreated.picturePath",
                    isGoogelPicture: "$userCreated.isGoogelPicture",
                },
            }
        };
        //Aggregate Now
        this.db.collection(collections_conse_1.cols.posts).aggregate([
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
                if (!lastPostId) //Check For First Time
                    return this.end_info(this.resource.iNotFoundAnyPost);
                return this.end_info(this.resource.noMorePosts);
            }
            let secondDate = date_time_service_1.DateTimeService.getDateNowManual;
            let dts = new date_time_service_1.DateTimeService();
            dts.resource = this.resource;
            dts.lanugageCode = this.languageCode;
            //Update User Created Picture Full Path And Post Date Time Since
            res.forEach(s => {
                s.userCreated.picturePath = user_service_1.UserService.getUserPicturePath(s.userCreated),
                    s.generatedDateTimeSince = dts.getDateTimeSince(s.generatedDate, secondDate);
            });
            this.end_successfully(this.resource.successfully, res);
        }).catch(eror => this.catchError2(eror, this));
    }
    /**
     * Get Last Posts For Landing Page
     * @param languageCode Language Code Target
     */
    getLastPosts(languageCode) {
        let matchST = {
            $match: {
                languageCode: languageCode,
                isActive: true,
                isPublic: true,
            }
        };
        //Project Stage
        let projectST = {
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
        this.db.collection(collections_conse_1.cols.posts).aggregate([
            matchST,
            { $sort: { generatedDate: -1, } },
            { $limit: 5 },
            { $lookup: { from: "users", localField: "userId", foreignField: "_id", as: "userCreated" } },
            {
                $unwind: {
                    path: "$userCreated",
                    preserveNullAndEmptyArrays: true
                }
            },
            projectST
        ])
            .toArray().then(res => {
            //Check From Length
            if (res.length == 0) {
                return this.end_info(this.resource.iNotFoundAnyPost);
            }
            //Update User Created Picture Full Path
            res.forEach(s => s.userCreated.picturePath = user_service_1.UserService.getUserPicturePath(s.userCreated));
            this.end_successfully(this.resource.successfully, res);
        }).catch(eror => this.catchError2(eror, this));
    }
    /**
     * Get Posts Current User Love There
     */
    getPostsLoveThere(limit, lastPostId) {
        this.getPostsReactThere(limit, lastPostId, "postsLoveIds");
    }
    /**
     * Get Posts Current User Not Love There
    */
    getPostsNotLoveThere(limit, lastPostId) {
        this.getPostsReactThere(limit, lastPostId, "postsNotLoveIds");
    }
    /**
    * Get Posts Current User Favorite There
    */
    getPostsFavoriteThere(limit, lastPostId) {
        this.getPostsReactThere(limit, lastPostId, "postsFavoriteIds");
    }
    /**
     * Get Posts Fro Current User If React On It
     * @param limit
     * @param lastPostId
     */
    getPostsReactThere(limit, lastPostId, arrayOfReactName) {
        //Skip Stage
        let skipST = {
            $match: {
                "$post.isActive": true,
            }
        };
        //Get  Posts Generated Before Last  Post Date Selected 'For Paging'
        if (lastPostId && lastPostId != 'null' && lastPostId != 'undefined')
            skipST["$match"].generatedDate = { $lt: new mongodb_1.ObjectId(lastPostId).getTimestamp() };
        this.db.collection(collections_conse_1.cols.users).aggregate([
            { $match: { _id: new mongodb_1.ObjectId(this.loggedUser._id) } },
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
                if (!lastPostId) //Check For First Time
                    return this.end_info(this.resource.iNotFoundAnyPost);
                return this.end_info(this.resource.noMorePosts);
            }
            //Update User Created Picture Full Path
            res.forEach(s => s.userCreated.picturePath = user_service_1.UserService.getUserPicturePath(s.userCreated));
            this.end_successfully(this.resource.successfully, res);
        }).catch(error => this.catchError2(error, this));
    }
    /**
    * Current User Make Love
    * Remove Current User From Not Love Array In (Post And User Information Document)
    * Add Current User To Love Array In (Post And User Information Document)
    * @param id
    */
    love(id) {
        this.db.collection(collections_conse_1.cols.posts).countDocuments({
            _id: new mongodb_1.ObjectId(id),
            userLoveIds: new mongodb_1.ObjectId(this.loggedUser._id)
        }).then(count => {
            if (count)
                return this.end_successfully(this.resource.loveSuccessfully);
            //Update Post
            this.db.collection(collections_conse_1.cols.posts).updateOne({ _id: new mongodb_1.ObjectId(id) }, {
                //Add To Love Array
                $push: { userLoveIds: new mongodb_1.ObjectId(this.loggedUser._id) },
                //Remove From Not Love Array
                $pull: { userNotLoveIds: new mongodb_1.ObjectId(this.loggedUser._id) }
            }).then(res => {
                if (!res.matchedCount)
                    return this.end_failed(this.resource.postIsNotFound);
                else if (!res.modifiedCount)
                    return this.end_successfully(this.resource.loveSuccessfully);
                //Update User Information
                this.db.collection(collections_conse_1.cols.users).updateOne({ _id: new mongodb_1.ObjectId(this.loggedUser._id) }, {
                    //Add To Love Array
                    $push: { postsLoveIds: { actionDate: date_time_service_1.DateTimeService.getDateNowManual, targetId: new mongodb_1.ObjectId(id) } },
                    //Remove From Not Love Array
                    $pull: { postsNotLoveIds: { targetId: new mongodb_1.ObjectId(id) } }
                });
                return this.end_successfully(this.resource.loveSuccessfully);
            }).catch(err => this.catchError2(err, this));
        }).catch(err => this.catchError2(err, this));
    }
    /**
    * Current User Make Not Love
    * Remove Current User To Love Array In (Post And User Information Document)
    * Add Current User From Not Love Array  In (Post And User Information Document)
    * @param id
    */
    notLove(id) {
        this.db.collection(collections_conse_1.cols.posts).countDocuments({
            _id: new mongodb_1.ObjectId(id),
            userNotLoveIds: new mongodb_1.ObjectId(this.loggedUser._id)
        }).then(count => {
            if (count)
                return this.end_successfully(this.resource.unLoveSuccessfully);
            //Update Post
            this.db.collection(collections_conse_1.cols.posts).updateOne({ _id: new mongodb_1.ObjectId(id) }, {
                //Add To Not Love Array
                $push: { userNotLoveIds: new mongodb_1.ObjectId(this.loggedUser._id) },
                //Remove From Love Array
                $pull: { userLoveIds: new mongodb_1.ObjectId(this.loggedUser._id) }
            }).then(res => {
                if (!res.matchedCount)
                    return this.end_failed(this.resource.postIsNotFound);
                //Update User Information
                this.db.collection(collections_conse_1.cols.users).updateOne({ _id: new mongodb_1.ObjectId(this.loggedUser._id) }, {
                    //Add To Not Love Array
                    $push: { postsNotLoveIds: { actionDate: date_time_service_1.DateTimeService.getDateNowManual, targetId: new mongodb_1.ObjectId(id) } },
                    //Remove From Love Array
                    $pull: { postsLoveIds: { targetId: new mongodb_1.ObjectId(id) } }
                });
                return this.end_successfully(this.resource.unLoveSuccessfully);
            }).catch(err => this.catchError2(err, this));
        }).catch(err => this.catchError2(err, this));
    }
    /**
    * Current User Make Favorite Or Un Favorite
    * @param id
    */
    favorite(id) {
        let shortQuery = {}, userQuery = {};
        this.db.collection(collections_conse_1.cols.posts).countDocuments({
            _id: new mongodb_1.ObjectId(id),
            userFavoriteIds: new mongodb_1.ObjectId(this.loggedUser._id)
        }).then(count => {
            //Check If Favorite 
            if (count) {
                //Un-Favorite
                shortQuery = { $pull: { userFavoriteIds: new mongodb_1.ObjectId(this.loggedUser._id) } };
                userQuery = { $pull: { postsFavoriteIds: { targetId: new mongodb_1.ObjectId(id) } } };
            }
            else {
                //Favorite
                shortQuery = { $push: { userFavoriteIds: new mongodb_1.ObjectId(this.loggedUser._id) } };
                userQuery = { $push: { postsFavoriteIds: { actionDate: date_time_service_1.DateTimeService.getDateNowManual, targetId: new mongodb_1.ObjectId(id) } } };
            }
            //Update Post
            this.db.collection(collections_conse_1.cols.posts).updateOne({ _id: new mongodb_1.ObjectId(id) }, shortQuery).then(res => {
                if (!res.matchedCount)
                    return this.end_failed(this.resource.postIsNotFound);
                else if (!res.modifiedCount)
                    return this.end_successfully(count ? this.resource.unFavoriteSuccessfully : this.resource.favoriteSuccessfully);
                //Update User Information
                this.db.collection(collections_conse_1.cols.users).updateOne({ _id: new mongodb_1.ObjectId(this.loggedUser._id) }, userQuery);
                return this.end_successfully(count ? this.resource.unFavoriteSuccessfully : this.resource.favoriteSuccessfully);
            }).catch(err => this.catchError2(err, this));
        }).catch(err => this.catchError2(err, this));
    }
    /**
     * Update Post Vistor To Activity And Save Vistor Information
     * @param postId
     * @param vistorId
     */
    updatePostVistorToActivity(postId, vistorId) {
        let vistor = {
            _id: new mongodb_1.ObjectId(vistorId),
            isMakeActivityWithPost: true,
            loggedUserId: this.loggedUser ? new mongodb_1.ObjectId(this.loggedUser._id) : null
            //Another Information Here
        };
        this.db.collection(collections_conse_1.cols.posts).updateOne({ _id: new mongodb_1.ObjectId(postId) }, {
            $set: { "vistors.$[v]": vistor }
        }, { arrayFilters: [{ "v._id": new mongodb_1.ObjectId(vistorId) }] }).then(res => {
            if (!res.modifiedCount)
                return this.end_failed(this.resource.someErrorHasBeen);
            return this.end_successfully(this.resource.successfully);
        }).catch(err => this.catchError2(err, this));
    }
    /**
    * Get Dashbord Information For Current User
    */
    dashbordInfo() {
        this.db.collection(collections_conse_1.cols.posts).find({ userId: new mongodb_1.ObjectId(this.loggedUser._id) }, { fields: { isActive: true, isPublic: true } }).toArray()
            .then(res => {
            let dash = new dashbord_information_1.DashbordInformation();
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
    fillAdvertisement(a) {
        return {
            advertiseingNetworkType: a.advertiseingNetworkType,
            adsense_pub: a.adsense_pub,
            adsense_slot: a.adsense_slot
        };
    }
    /**
      * Get Posts Current User Loved
      */
    getPostsActivities(skip, limit, isLovedVideos, isNotLovedVideos = false, isFavoriteVideos = false) {
        let localFieldTarget, unwindFoeldTarget;
        let sortStage = {};
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
        this.db.collection(collections_conse_1.cols.users).aggregate([
            { $match: { "_id": new mongodb_1.ObjectId(this.loggedUser._id) } },
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
                    landingPageUrl: { $concat: [congif_const_1.config.websiteUrl, "/_", "$post.landingPageId"] }
                }
            }
        ]).toArray((error, arr) => {
            if (error)
                return this.end_failed(this.resource.someErrorHasBeen, error);
            if (arr.length == 0)
                if (skip == 0)
                    return this.end_info(this.resource.noPostsFound, true);
                else
                    return this.end_info(this.resource.noMorePosts, true);
            return this.end_successfully(this.resource.successfully, arr);
        });
    }
    /** Current User Remove Love    */
    removeActivityLove(id) {
        //Remove User Id From Post Loves Arry
        this.db.collection(collections_conse_1.cols.posts).updateOne({ _id: new mongodb_1.ObjectId(id) }, {
            $pull: { "userLoveIds": new mongodb_1.ObjectId(this.loggedUser._id) }
        }).then(res => {
            //Remove Post Id From Uswer Posts Love Arry
            this.db.collection(collections_conse_1.cols.users).updateOne({ _id: new mongodb_1.ObjectId(this.loggedUser._id) }, {
                $pull: { "postsLoveIds": { targetId: new mongodb_1.ObjectId(id) } }
            });
            return this.end_successfully(this.resource.removedPostFromLoveList);
        }).catch(c => this.catchError(c));
    }
    /** Current User Remove Not Love    */
    removeActivityNotLove(id) {
        //Remove User Id From Post Not Loves Arry
        this.db.collection(collections_conse_1.cols.posts).updateOne({ _id: new mongodb_1.ObjectId(id) }, {
            $pull: { "userNotLoveIds": new mongodb_1.ObjectId(this.loggedUser._id) }
        }).then(res => {
            //Remove Post Id From User Posts Not Love Arry
            this.db.collection(collections_conse_1.cols.users).updateOne({ _id: new mongodb_1.ObjectId(this.loggedUser._id) }, {
                $pull: { "postsNotLoveIds": { targetId: new mongodb_1.ObjectId(id) } }
            });
            return this.end_successfully(this.resource.removedPostFromNotLoveList);
        }).catch(c => this.catchError(c));
    }
    /** Current User Remove Favorite   */
    removeActivityFavorite(id) {
        //Remove User Id From Post Favorites Arry
        this.db.collection(collections_conse_1.cols.posts).updateOne({ _id: new mongodb_1.ObjectId(id) }, {
            $pull: { "userFavoriteIds": new mongodb_1.ObjectId(this.loggedUser._id) }
        }).then(res => {
            //Remove Post Id From User Posts Favorite Arry
            this.db.collection(collections_conse_1.cols.users).updateOne({ _id: new mongodb_1.ObjectId(this.loggedUser._id) }, {
                $pull: {
                    "postsFavoriteIds": { targetId: new mongodb_1.ObjectId(id) }
                }
            });
            return this.end_successfully(this.resource.removedPostFromFavoriteList);
        }).catch(c => this.catchError(c));
    }
} //End Class
exports.PostModule = PostModule;
//# sourceMappingURL=post.module.js.map