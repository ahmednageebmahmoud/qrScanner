import { Request, Response } from "express";
import { VideoModule } from "../modules/video.module";
import { VideoModel } from "../models/video.model";

export class VideoController {

    /**
  *  Generate New Landing Page Id
  * @param req 
  * @param res 
  */
    generateNewLandingPageId(req: Request, res: Response) {
        new VideoModule(req, res).generateNewLandingPageId();
    }

    /**
     *  Add New Video 
     * @param req 
     * @param res 
     */
    addNewVideo(req: Request, res: Response) {
        new VideoModule(req, res).addNewVideo(<VideoModel>req.body);
    }

    /**
         *  Get Videos By Category Id
         * @param req 
         * @param res 
         */
    getVideosByCategoryId(req: Request, res: Response) {
        new VideoModule(req, res).getVideosByCategoryId(req.params.vidoeCategoryId);
    }


    /**
     * Get Video Details For Display
     * @param req 
     * @param res 
     */
    getVideoDetailsForDisplay(req: Request, res: Response) {
        new VideoModule(req, res).getVideoDetailsForDisplay(req.params.videoId);
    }


    /**
   * Get Top Videos For Display In Videos Page
   *  Get Videos For Videos Page
   * @param req 
   * @param res 
   */
    getTopVideos(req: Request, res: Response) {
        new VideoModule(req, res).getTopVideos();
    }

    /**
     *  Love Video 
     * @param req 
     * @param res 
     */
    addActivityLove(req: Request, res: Response) {
        new VideoModule(req, res).addActivityLove(req.params.id, Boolean(req.params.isWasNotLove));
    }

    /**
 *  Not Love Video 
 * @param req 
 * @param res 
 */
    addActivityNotLove(req: Request, res: Response) {
        new VideoModule(req, res).addActivityNotLove(req.params.id, Boolean(req.params.isWasLove));
    }



    /**
 *  Favorite
 * @param req 
 * @param res 
 */
    addActivityFavorite(req: Request, res: Response) {
        new VideoModule(req, res).addActivityFavorite(req.params.id);
    }




    /**
     *  Get Videos Current User Loved
     */
    getVideosActivitiesLoved(req: Request, res: Response) {
        new VideoModule(req, res).getVideosActivities(+req.params.skip, +req.params.limit,true );
    }
    /**
     *  Get Videos Current User Not Loved
     */
    getVideosActivitiesNotLoved(req: Request, res: Response) {
        new VideoModule(req, res).getVideosActivities(+req.params.skip, +req.params.limit,false,true );
    }

    /**
     *  Get Videos Current User Favorite
     */
    getVideosActivitiesFavorite(req: Request, res: Response) {
        new VideoModule(req, res).getVideosActivities(+req.params.skip, +req.params.limit,false,false,true );
    }



    /** Current User Remove Love : api/video/remove/love   */
    removeActivityLove(req: Request, res: Response) {
        new VideoModule(req, res).removeActivityLove(req.params.id);
    }

    /** Current User Remove Not Love : api/video/remove/notLove   */
    removeActivityNotLove(req: Request, res: Response) {
        new VideoModule(req, res).removeActivityNotLove(req.params.id);
    }

    /** Current User Remove Favorite   */
    removeActivityFavorite(req: Request, res: Response) {
        new VideoModule(req, res).removeActivityFavorite(req.params.id);
    }






}//End Class