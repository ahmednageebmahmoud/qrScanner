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
    love(req: Request, res: Response) {
        new VideoModule(req, res).love(req.params.id);
    }

    /**
 *  Not Love Video 
 * @param req 
 * @param res 
 */
    notLove(req: Request, res: Response) {
        new VideoModule(req, res).notLove(req.params.id);
    }



    /**
 *  Favorite
 * @param req 
 * @param res 
 */
    favorite(req: Request, res: Response) {
        new VideoModule(req, res).favorite(req.params.id);
    }


}//End Class