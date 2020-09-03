import express, { Request, Response, Router } from 'express';
import { AuthGuardService } from '../services/auth.guard.service';
import { VideoController } from '../controllers/videos.controller';

const videosRouter = Router();
const cont = new VideoController();

/** Generate New Landing Page Id For Add New Video : api/video/generateNewLandingPageId   */
videosRouter.get('/generateNewLandingPageId', cont.generateNewLandingPageId);


/** Get Top Videos For Display In Videos Page : api/video/getTopVideos   */
videosRouter.get('/getTopVideos', cont.getTopVideos);

/** Get Videos FBy Category Id : api/video/getTopVideos   */
videosRouter.get('/getVideosByCategoryId/:vidoeCategoryId', cont.getVideosByCategoryId);


/** Get Video Details For Display : api/video/getVideoDetailsForDisplay   */
videosRouter.get('/getVideoDetailsForDisplay/:videoId', cont.getVideoDetailsForDisplay);



/** Current User Make Love : api/video/love   */
videosRouter.post('/love/:id', AuthGuardService.checkIfAuthrized, cont.love);

/** Current User Make Not Love : api/video/notLove   */
videosRouter.post('/notove/:id', AuthGuardService.checkIfAuthrized, cont.notLove);

/** Current User Make Favorite : api/video/favorite   */
videosRouter.post('/favorite/:id', AuthGuardService.checkIfAuthrized, cont.favorite);


export { videosRouter };