import { AuthGuardService } from '../services/auth.guard.service';
import { Router } from 'express';
import { PostController } from '../controllers/post.contoleer';

const cont = new PostController(),
    r = Router();

/** Get Posts : api/post/getPosts   */
r.get('/getPosts/:limit/:lastPostId?/:postLanguageCode?/:currentUserAction?/:createdUserName?', cont.getPosts);

/** Get Last Posts For Landing Page  : api/post/getLastPosts/:languageCode */
r.get('/getLastPosts/:languageCode', cont.getLastPosts);




/** Get Dashbord Information : api/post/dashbord   */
//r.get('/dashbordInfo',AuthGuardService.checkIfAuthrized, cont.dashbordInfo);

/** Get Post Details For Dispaly In Landing Page : api/post/getPostDetails   */
r.get('/getPostDetails/:id', cont.getPostDetails);

/** Create New Post : api/post/create   */
r.post('/create', AuthGuardService.checkIfAuthrized, cont.create);


/** Update Post Vistor To Activity : api/post/updatePostVistorToActivity/:postId/:vistorId   */
r.post('/updatePostVistorToActivity/:postId/:vistorId', cont.updatePostVistorToActivity);


/** Update Post  : api/post/update*/
//r.put('/update', AuthGuardService.checkIfAuthrized, cont.update);

/** Get Posts For Logged User : api/post/getMyPosts   */
r.post('/getMyPosts/:skip/:limit', AuthGuardService.checkIfAuthrized, cont.getMyPosts);

/** Update Defualt Setting For posts : api/post/updateDefaultSetting/:isApplyOnLastPosts   */
//r.put('/updateDefultSetting/:isApplyOnLastPosts', AuthGuardService.checkIfAuthrized, cont.updateDefultSetting);



/** Current User Remove Love : api/post/remove/love   */
r.put('/activities/love/remove/:id', AuthGuardService.checkIfAuthrized, cont.removeActivityLove);

/** Current User Remove Not Love : api/post/remove/notLove   */
r.put('/activities/notLove/remove/:id', AuthGuardService.checkIfAuthrized, cont.removeActivityNotLove);

/** Current User Remove Favorite : api/post/remove/favorite   */
r.put('/activities/favorite/remove/:id', AuthGuardService.checkIfAuthrized, cont.removeActivityFavorite);

/** Current User Make Love : api/post/love   */
r.post('/activities/love/:id', AuthGuardService.checkIfAuthrized, cont.love);

/** Current User Make Not Love : api/post/unLove   */
r.post('/activities/notLove/:id', AuthGuardService.checkIfAuthrized, cont.notLove);

/** Current User Make Favorite : api/post/favorite   */
r.post('/activities/favorite/:id', AuthGuardService.checkIfAuthrized, cont.favorite);




/** Get Posts Current User Loved : api/post/activities/love/:skip/:limit   */
r.get('/activities/love/:skip/:limit', AuthGuardService.checkIfAuthrized, cont.getPostsActivitiesLoved);

/** Get Posts Current User Not Loved : api/post/activities/notLove/:skip/:limit   */
r.get('/activities/notLove/:skip/:limit', AuthGuardService.checkIfAuthrized, cont.getPostsActivitiesNotLoved);

/** Get Posts Current User Favorite : api/post/activities/favorite/:skip/:limit   */
r.get('/activities/favorite/:skip/:limit', AuthGuardService.checkIfAuthrized, cont.getPostsActivitiesFavorite);

export { r as postsRouter }