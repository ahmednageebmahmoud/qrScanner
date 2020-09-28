"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PostController = void 0;
const post_module_1 = require("../modules/post.module");
class PostController {
    /**
     * Get Posts
     * @param req
     * @param res
     */
    getPosts(req, res) {
        new post_module_1.PostModule(req, res).getPosts(+req.params.limit, req.params.lastPostId, req.params.postLanguageCode, req.params.currentUserAction, req.params.createdUserName);
    }
    /**
     * Get Last Posts For Landing Page
     * @param req
     * @param res
     */
    getLastPosts(req, res) {
        new post_module_1.PostModule(req, res).getLastPosts(req.params.languageCode);
    }
    /**
     * Get Posts Current User Love There
     * @param req
     * @param res
     */
    getPostsLoveThere(req, res) {
        new post_module_1.PostModule(req, res).getPostsLoveThere(+req.params.limit, req.params.lastPostId);
    }
    /**
     * Get Posts Current User Not Love There
     * @param req
     * @param res
     */
    getPostsNotLoveThere(req, res) {
        new post_module_1.PostModule(req, res).getPostsNotLoveThere(+req.params.limit, req.params.lastPostId);
    }
    /**
     * Get Posts Current User Favorite There
     * @param req
     * @param res
     */
    getPostsFavoriteThere(req, res) {
        new post_module_1.PostModule(req, res).getPostsFavoriteThere(+req.params.limit, req.params.lastPostId);
    }
    /**
     * Current User Make Love
     * @param req
     * @param res
     */
    love(req, res) {
        new post_module_1.PostModule(req, res).love(req.params.id);
    }
    /**
     * Current User Make Not Love
     * @param req
     * @param res
     */
    notLove(req, res) {
        new post_module_1.PostModule(req, res).notLove(req.params.id);
    }
    /**
     * Current User Make Favorite
     * @param req
     * @param res
     */
    favorite(req, res) {
        new post_module_1.PostModule(req, res).favorite(req.params.id);
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
    getPostDetails(req, res) {
        new post_module_1.PostModule(req, res).getPostDetails(req.params.id);
    }
    /**
 *  Create New Post
 * @param req
 * @param res
 */
    create(req, res) {
        new post_module_1.PostModule(req, res).create();
    }
    /**
     * Update Post
     * @param req
     * @param res
     */
    update(req, res) {
        new post_module_1.PostModule(req, res).update(req.body);
    }
    /**
     * Delete Post
     * @param req
     * @param res
     */
    delete(req, res) {
        new post_module_1.PostModule(req, res).delete(req.params.id);
    }
    /**
     * Get Post For Logged User
     * @param req
     * @param res
     */
    getMyPosts(req, res) {
        new post_module_1.PostModule(req, res).getMyPosts(+req.params.skip, +req.params.limit, req.body);
    }
    /**
     * Update Defualt Setting For posts
     * @param req
     * @param res
     */
    updateDefultSetting(req, res) {
        new post_module_1.PostModule(req, res).updateDefultSetting(req.params.isApplyOnLastPosts, req.body);
    }
    /**
     * Update Post Vistor To Activity
     * @param req
     * @param res
     */
    updatePostVistorToActivity(req, res) {
        new post_module_1.PostModule(req, res).updatePostVistorToActivity(req.params.postId, req.params.vistorId);
    }
    /**
     *  Get Posts Current User Loved
     */
    getPostsActivitiesLoved(req, res) {
        new post_module_1.PostModule(req, res).getPostsActivities(+req.params.skip, +req.params.limit, true);
    }
    /**
     *  Get Posts Current User Not Loved
     */
    getPostsActivitiesNotLoved(req, res) {
        new post_module_1.PostModule(req, res).getPostsActivities(+req.params.skip, +req.params.limit, false, true);
    }
    /**
     *  Get Posts Current User Favorite
     */
    getPostsActivitiesFavorite(req, res) {
        new post_module_1.PostModule(req, res).getPostsActivities(+req.params.skip, +req.params.limit, false, false, true);
    }
    /** Current User Remove Love : api/post/remove/love   */
    removeActivityLove(req, res) {
        new post_module_1.PostModule(req, res).removeActivityLove(req.params.id);
    }
    /** Current User Remove Not Love : api/post/remove/notLove   */
    removeActivityNotLove(req, res) {
        new post_module_1.PostModule(req, res).removeActivityNotLove(req.params.id);
    }
    /** Current User Remove Favorite   */
    removeActivityFavorite(req, res) {
        new post_module_1.PostModule(req, res).removeActivityFavorite(req.params.id);
    }
} //End Class
exports.PostController = PostController;
//# sourceMappingURL=post.contoleer.js.map