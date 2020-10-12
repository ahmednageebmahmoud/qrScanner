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
        new PostModule(req, res).getPosts(+req.params.limit, req.params.lastPostId, req.params.postLanguageCode, req.params.currentUserAction, req.params.createdUserName);
    }

    /**
     * Get Last Posts For Landing Page 
     * @param req 
     * @param res 
     */
    getLastPosts(req: Request, res: Response) {
        new PostModule(req, res).getLastPosts(req.params.languageCode);
    }


    /**
     * Get Posts Current User Love There
     * @param req 
     * @param res 
     */
    getPostsLoveThere(req: Request, res: Response) {
        new PostModule(req, res).getPostsLoveThere(+req.params.limit, req.params.lastPostId);
    }

    /**
     * Get Posts Current User Not Love There
     * @param req 
     * @param res 
     */
    getPostsNotLoveThere(req: Request, res: Response) {
        new PostModule(req, res).getPostsNotLoveThere(+req.params.limit, req.params.lastPostId);
    }


    /**
     * Get Posts Current User Favorite There
     * @param req 
     * @param res 
     */
    getPostsFavoriteThere(req: Request, res: Response) {
        new PostModule(req, res).getPostsFavoriteThere(+req.params.limit, req.params.lastPostId);
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
     * Get Post Detials For Edit
     * @param req 
     * @param res 
     */
    getPostDetailsForEdit(req: Request, res: Response) {
        new PostModule(req, res).getPostDetailsForEdit(req.params.landingPageId);
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
     * Update Post  
     * @param req 
     * @param res 
     */
    update(req: Request, res: Response) {
        new PostModule(req, res).update();
    }

    
    /**
     * Delete Post  
     * @param req 
     * @param res 
     */
    delete(req: Request, res: Response) {
        new PostModule(req, res).delete(req.params.id);
    }
    
    /**
     * Get Post For Logged User
     * @param req 
     * @param res 
     */
    getMyPosts(req: Request, res: Response) {
        new PostModule(req, res).getMyPosts(+req.params.skip, +req.params.limit, req.body);
    }


    /**
     * Update Post Vistor To Activity
     * @param req 
     * @param res 
     */
    updatePostVistorToActivity(req: Request, res: Response) {
        new PostModule(req, res).updatePostVistorToActivity(req.params.postId, req.params.vistorId);
    }

    /**
     *  Get Posts Current User Loved
     */
    getPostsActivitiesLoved(req: Request, res: Response) {
        new PostModule(req, res).getPostsActivities(+req.params.skip, +req.params.limit, true);
    }
    /**
     *  Get Posts Current User Not Loved
     */
    getPostsActivitiesNotLoved(req: Request, res: Response) {
        new PostModule(req, res).getPostsActivities(+req.params.skip, +req.params.limit, false, true);
    }

    /**
     *  Get Posts Current User Favorite
     */
    getPostsActivitiesFavorite(req: Request, res: Response) {
        new PostModule(req, res).getPostsActivities(+req.params.skip, +req.params.limit, false, false, true);
    }



    /** Current User Remove Love : api/post/remove/love   */
    removeActivityLove(req: Request, res: Response) {
        new PostModule(req, res).removeActivityLove(req.params.id);
    }

    /** Current User Remove Not Love : api/post/remove/notLove   */
    removeActivityNotLove(req: Request, res: Response) {
        new PostModule(req, res).removeActivityNotLove(req.params.id);
    }

    /** Current User Remove Favorite   */
    removeActivityFavorite(req: Request, res: Response) {
        new PostModule(req, res).removeActivityFavorite(req.params.id);
    }

    /** Get Post Activities Anlysis   */
    getPostsActivitiesAnlysis(req: Request, res: Response) {
        new PostModule(req, res).getPostsActivitiesAnlysis(req.params.landingPageId);
    }
    


}//End Class