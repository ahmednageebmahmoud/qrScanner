import express, { Request, Response, Router } from 'express';
import { AuthGuardService } from '../services/auth.guard.service';
import { PostController } from '../controllers/post.contoleer';

const postsRouter = Router();
const cont = new PostController();

/** Get Posts : api/post/getPosts   */
postsRouter.get('/getPosts/:limit/:lastPostId?/:postLanguageCode?/:currentUserAction?/:createdUserName?', cont.getPosts);

/** Get Last Posts For Landing Page  : api/post/getLastPosts */
postsRouter.get('/getLastPosts', cont.getLastPosts);

/** Get Posts Current User Love There   : api/post/getPostsLoveThere/:limit/:lastPostId? */
//postsRouter.get('/getPostsLoveThere/:limit/:lastPostId?', AuthGuardService.checkIfAuthrized, cont.getPostsLoveThere);
/** Get Posts Current User Not Love There : api/post/getPostsNotLoveThere/:limit/:lastPostId? */
//postsRouter.get('/getPostsNotLoveThere/:limit/:lastPostId?', AuthGuardService.checkIfAuthrized, cont.getPostsNotLoveThere);
/** Get Posts Current User Favorite There  : api/post/getPostsFavoriteThere/:limit/:lastPostId? */
//postsRouter.get('/getPostsFavoriteThere/:limit/:lastPostId?', AuthGuardService.checkIfAuthrized, cont.getPostsFavoriteThere);

/** Current User Make Love : api/post/love   */
postsRouter.post('/love/:id',AuthGuardService.checkIfAuthrized, cont.love);

/** Current User Make Not Love : api/post/unLove   */
postsRouter.post('/notLove/:id',AuthGuardService.checkIfAuthrized, cont.notLove);

/** Current User Make Favorite : api/post/favorite   */
postsRouter.post('/favorite/:id',AuthGuardService.checkIfAuthrized, cont.favorite);


/** Get Dashbord Information : api/post/dashbord   */
//postsRouter.get('/dashbordInfo',AuthGuardService.checkIfAuthrized, cont.dashbordInfo);

/** Get Post Details For Dispaly In Landing Page : api/post/getPostDetails   */
postsRouter.get('/getPostDetails/:id', cont.getPostDetails);

/** Create New Post : api/post/create   */
postsRouter.post('/create',AuthGuardService.checkIfAuthrized, cont.create);

/** Update Post  : api/post/update*/
//postsRouter.put('/update', AuthGuardService.checkIfAuthrized, cont.update);

/** Get Posts For Logged User : api/post/getMyPosts   */
//postsRouter.get('/getMyPosts/:isPublic/:isActive/:limit/:lastPostId?', AuthGuardService.checkIfAuthrized, cont.getMyPosts);

/** Update Defualt Setting For posts : api/post/updateDefaultSetting/:isApplyOnLastPosts   */
//postsRouter.put('/updateDefultSetting/:isApplyOnLastPosts', AuthGuardService.checkIfAuthrized, cont.updateDefultSetting);

//Export Now
export { postsRouter };