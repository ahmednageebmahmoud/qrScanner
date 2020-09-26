import { Router } from 'express';
import { AuthGuardService } from '../services/auth.guard.service';
import { VideoController } from '../controllers/videos.controller';

const cont = new VideoController(),
    r = Router();


/** Generate New Landing Page Id For Add New Video : api/video/generateNewLandingPageId   */
r.get('/generateNewLandingPageId', cont.generateNewLandingPageId);


/** Get Top Videos For Display In Videos Page : api/video/getTopVideos   */
r.get('/getTopVideos', cont.getTopVideos);

/** Get Videos FBy Category Id : api/video/getTopVideos   */
r.get('/getVideosByCategoryId/:vidoeCategoryId', cont.getVideosByCategoryId);


/** Get Video Details For Display : api/video/getVideoDetailsForDisplay   */
r.get('/getVideoDetailsForDisplay/:videoId', cont.getVideoDetailsForDisplay);





/** Current User Remove Love : api/video/remove/love   */
r.put('/activities/love/remove/:id', AuthGuardService.checkIfAuthrized, cont.removeActivityLove);

/** Current User Remove Not Love : api/video/remove/notLove   */
r.put('/activities/notLove/remove/:id', AuthGuardService.checkIfAuthrized, cont.removeActivityNotLove);

/** Current User Remove Favorite : api/video/remove/favorite   */
r.put('/activities/favorite/remove/:id', AuthGuardService.checkIfAuthrized, cont.removeActivityFavorite);

/** Current User Make Love : api/video/love   */
r.post('/activities/love/:id/:isWasNotLove', AuthGuardService.checkIfAuthrized, cont.addActivityLove);

/** Current User Make Not Love : api/video/notLove   */
r.post('/activities/notLove/:id/:isWasLove', AuthGuardService.checkIfAuthrized, cont.addActivityNotLove);

/** Current User Make Favorite : api/video/favorite   */
r.post('/activities/favorite/:id', AuthGuardService.checkIfAuthrized, cont.addActivityFavorite);





/** Get Videos Current User Loved : api/video/activities/love/:skip/:limit   */
r.get('/activities/love/:skip/:limit', AuthGuardService.checkIfAuthrized, cont.getVideosActivitiesLoved);

/** Get Videos Current User Not Loved : api/video/activities/notLove/:skip/:limit   */
r.get('/activities/notLove/:skip/:limit', AuthGuardService.checkIfAuthrized, cont.getVideosActivitiesNotLoved);

/** Get Videos Current User Favorite : api/video/activities/favorite/:skip/:limit   */
r.get('/activities/favorite/:skip/:limit', AuthGuardService.checkIfAuthrized, cont.getVideosActivitiesFavorite);

export { r as videosRouter }