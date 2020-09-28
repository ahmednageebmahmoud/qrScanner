"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VideoController = void 0;
const video_module_1 = require("../modules/video.module");
class VideoController {
    /**
  *  Generate New Landing Page Id
  * @param req
  * @param res
  */
    generateNewLandingPageId(req, res) {
        new video_module_1.VideoModule(req, res).generateNewLandingPageId();
    }
    /**
     *  Add New Video
     * @param req
     * @param res
     */
    addNewVideo(req, res) {
        new video_module_1.VideoModule(req, res).addNewVideo(req.body);
    }
    /**
         *  Get Videos By Category Id
         * @param req
         * @param res
         */
    getVideosByCategoryId(req, res) {
        new video_module_1.VideoModule(req, res).getVideosByCategoryId(req.params.vidoeCategoryId);
    }
    /**
     * Get Video Details For Display
     * @param req
     * @param res
     */
    getVideoDetailsForDisplay(req, res) {
        new video_module_1.VideoModule(req, res).getVideoDetailsForDisplay(req.params.videoId);
    }
    /**
   * Get Top Videos For Display In Videos Page
   *  Get Videos For Videos Page
   * @param req
   * @param res
   */
    getTopVideos(req, res) {
        new video_module_1.VideoModule(req, res).getTopVideos();
    }
    /**
     *  Love Video
     * @param req
     * @param res
     */
    addActivityLove(req, res) {
        new video_module_1.VideoModule(req, res).addActivityLove(req.params.id, Boolean(req.params.isWasNotLove));
    }
    /**
 *  Not Love Video
 * @param req
 * @param res
 */
    addActivityNotLove(req, res) {
        new video_module_1.VideoModule(req, res).addActivityNotLove(req.params.id, Boolean(req.params.isWasLove));
    }
    /**
 *  Favorite
 * @param req
 * @param res
 */
    addActivityFavorite(req, res) {
        new video_module_1.VideoModule(req, res).addActivityFavorite(req.params.id);
    }
    /**
     *  Get Videos Current User Loved
     */
    getVideosActivitiesLoved(req, res) {
        new video_module_1.VideoModule(req, res).getVideosActivities(+req.params.skip, +req.params.limit, true);
    }
    /**
     *  Get Videos Current User Not Loved
     */
    getVideosActivitiesNotLoved(req, res) {
        new video_module_1.VideoModule(req, res).getVideosActivities(+req.params.skip, +req.params.limit, false, true);
    }
    /**
     *  Get Videos Current User Favorite
     */
    getVideosActivitiesFavorite(req, res) {
        new video_module_1.VideoModule(req, res).getVideosActivities(+req.params.skip, +req.params.limit, false, false, true);
    }
    /** Current User Remove Love : api/video/remove/love   */
    removeActivityLove(req, res) {
        new video_module_1.VideoModule(req, res).removeActivityLove(req.params.id);
    }
    /** Current User Remove Not Love : api/video/remove/notLove   */
    removeActivityNotLove(req, res) {
        new video_module_1.VideoModule(req, res).removeActivityNotLove(req.params.id);
    }
    /** Current User Remove Favorite   */
    removeActivityFavorite(req, res) {
        new video_module_1.VideoModule(req, res).removeActivityFavorite(req.params.id);
    }
} //End Class
exports.VideoController = VideoController;
//# sourceMappingURL=videos.controller.js.map