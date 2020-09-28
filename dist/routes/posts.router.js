"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.postsRouter = void 0;
const auth_guard_service_1 = require("../services/auth.guard.service");
const express_1 = require("express");
const post_contoleer_1 = require("../controllers/post.contoleer");
const cont = new post_contoleer_1.PostController(), r = express_1.Router();
exports.postsRouter = r;
/** Get Posts : api/post/getPosts   */
r.get('/getPosts/:limit/:lastPostId?/:postLanguageCode?/:currentUserAction?/:createdUserName?', cont.getPosts);
/** Get Last Posts For Landing Page  : api/post/getLastPosts/:languageCode */
r.get('/getLastPosts/:languageCode', cont.getLastPosts);
/** Get Dashbord Information : api/post/dashbord   */
//r.get('/dashbordInfo',AuthGuardService.checkIfAuthrized, cont.dashbordInfo);
/** Get Post Details For Dispaly In Landing Page : api/post/getPostDetails   */
r.get('/getPostDetails/:id', cont.getPostDetails);
/** Create New Post : api/post/create   */
r.post('/create', auth_guard_service_1.AuthGuardService.checkIfAuthrized, cont.create);
/** Delete Post : api/post/delete/:id   */
r.delete('/delete/:id', auth_guard_service_1.AuthGuardService.checkIfAuthrized, cont.delete);
/** Update Post Vistor To Activity : api/post/updatePostVistorToActivity/:postId/:vistorId   */
r.post('/updatePostVistorToActivity/:postId/:vistorId', cont.updatePostVistorToActivity);
/** Update Post  : api/post/update*/
//r.put('/update', AuthGuardService.checkIfAuthrized, cont.update);
/** Get Posts For Logged User : api/post/getMyPosts   */
r.post('/getMyPosts/:skip/:limit', auth_guard_service_1.AuthGuardService.checkIfAuthrized, cont.getMyPosts);
/** Update Defualt Setting For posts : api/post/updateDefaultSetting/:isApplyOnLastPosts   */
//r.put('/updateDefultSetting/:isApplyOnLastPosts', AuthGuardService.checkIfAuthrized, cont.updateDefultSetting);
/** Current User Remove Love : api/post/remove/love   */
r.put('/activities/love/remove/:id', auth_guard_service_1.AuthGuardService.checkIfAuthrized, cont.removeActivityLove);
/** Current User Remove Not Love : api/post/remove/notLove   */
r.put('/activities/notLove/remove/:id', auth_guard_service_1.AuthGuardService.checkIfAuthrized, cont.removeActivityNotLove);
/** Current User Remove Favorite : api/post/remove/favorite   */
r.put('/activities/favorite/remove/:id', auth_guard_service_1.AuthGuardService.checkIfAuthrized, cont.removeActivityFavorite);
/** Current User Make Love : api/post/love   */
r.post('/activities/love/:id', auth_guard_service_1.AuthGuardService.checkIfAuthrized, cont.love);
/** Current User Make Not Love : api/post/unLove   */
r.post('/activities/notLove/:id', auth_guard_service_1.AuthGuardService.checkIfAuthrized, cont.notLove);
/** Current User Make Favorite : api/post/favorite   */
r.post('/activities/favorite/:id', auth_guard_service_1.AuthGuardService.checkIfAuthrized, cont.favorite);
/** Get Posts Current User Loved : api/post/activities/love/:skip/:limit   */
r.get('/activities/love/:skip/:limit', auth_guard_service_1.AuthGuardService.checkIfAuthrized, cont.getPostsActivitiesLoved);
/** Get Posts Current User Not Loved : api/post/activities/notLove/:skip/:limit   */
r.get('/activities/notLove/:skip/:limit', auth_guard_service_1.AuthGuardService.checkIfAuthrized, cont.getPostsActivitiesNotLoved);
/** Get Posts Current User Favorite : api/post/activities/favorite/:skip/:limit   */
r.get('/activities/favorite/:skip/:limit', auth_guard_service_1.AuthGuardService.checkIfAuthrized, cont.getPostsActivitiesFavorite);
//# sourceMappingURL=posts.router.js.map