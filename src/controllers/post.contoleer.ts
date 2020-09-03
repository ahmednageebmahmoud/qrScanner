import express, { Request, Response } from 'express';
import { PostModule } from '../modules/post.module';
import { PostModel } from '../models/post.model';
export class PostController {

    /**
     * Get Posts
     * @param req 
     * @param res 
     */
    getPosts(req: Request, res: Response) {
        new PostModule(req, res).getPosts( +req.params.limit, req.params.lastPostId,req.params.postLanguageCode,req.params.currentUserAction, req.params.createdUserName);
    }

    /**
     * Get Last Posts For Landing Page 
     * @param req 
     * @param res 
     */
    getLastPosts(req: Request, res: Response) {
        new PostModule(req, res).getLastPosts();
    }   


    /**
     * Get Posts Current User Love There
     * @param req 
     * @param res 
     */
    getPostsLoveThere(req: Request, res: Response) {
        new PostModule(req, res).getPostsLoveThere(+req.params.limit,req.params.lastPostId);
    }

    /**
     * Get Posts Current User Not Love There
     * @param req 
     * @param res 
     */
    getPostsNotLoveThere(req: Request, res: Response) {
        new PostModule(req, res).getPostsNotLoveThere(+req.params.limit,req.params.lastPostId);
    }


    /**
     * Get Posts Current User Favorite There
     * @param req 
     * @param res 
     */
    getPostsFavoriteThere(req: Request, res: Response) {
        new PostModule(req, res).getPostsFavoriteThere(+req.params.limit,req.params.lastPostId);
    }

    
    /**
     * Current User Make Love
     * @param req 
     * @param res 
     */
    love(req: Request, res: Response) {
        new PostModule(req, res).love(req.params.id);
    }

    /**
     * Current User Make Not Love
     * @param req 
     * @param res 
     */
    notLove(req: Request, res: Response) {
        new PostModule(req, res).notLove(req.params.id);
    }

    /**
     * Current User Make Favorite
     * @param req 
     * @param res 
     */
    favorite(req: Request, res: Response) {
        new PostModule(req, res).favorite(req.params.id);
    }

    /**
     * Get Dashbord Information For Current User
     dashbordInfo(req:Request,res:Response){
         new PostModule(req, res).dashbordInfo();
        }
  */

    
    /**
     * Get Shortner For Landing Page
     * @param req 
     * @param res 
     */
    getPostDetails(req: Request, res: Response) {
        new PostModule(req, res).getPostDetails(req.params.id);
    }

        /**
     *  Create New Post 
     * @param req 
     * @param res 
     */
    create(req: Request, res: Response) {
        new PostModule(req, res).create();
    }

    /**
     * Update Post Link
     * @param req 
     * @param res 
     */
    update(req: Request, res: Response) {
        new PostModule(req, res).update(<PostModel>req.body);
    }


    /**
     * Get Post For Logged User
     * @param req 
     * @param res 
     */
    getMyPosts(req: Request, res: Response) {
        new PostModule(req, res).getMyPosts(req.params.isPublic,
            req.params.isActive, +req.params.limit, req.params.lastPostId);
    }



    /**
     * Update Defualt Setting For posts
     * @param req 
     * @param res 
     */
    updateDefultSetting(req: Request, res: Response) {
        new PostModule(req, res).updateDefultSetting(req.params.isApplyOnLastPosts, req.body);
    }
}//End Class