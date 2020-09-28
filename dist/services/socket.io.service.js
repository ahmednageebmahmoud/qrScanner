"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SocketIOService = void 0;
const socket_io_1 = __importDefault(require("socket.io"));
const socket_io_events_const_1 = require("../consts/socket.io.events.const");
class SocketIOService {
    /** Init Socet Io  */
    init(httpServer) {
        const socketIOServer = socket_io_1.default(httpServer, {
            cookie: false,
        });
        //On Connect Event
        //socketIOServer.on("connect", this.onConnect);
        SocketIOService.socketServer = socketIOServer;
    }
    /** On New User Connected */
    onConnect(soc) {
        console.log('New User Connected');
        //Init Events Now
        //soc.on(SocketIOEvents.video_love, this.onVideoLove);
        //soc.on(SocketIOEvents.video_notLove, this.onVideoNotLove);
        //soc.on(SocketIOEvents.video_favorite, this.onVideoFavorite);
    }
    /**
     * On Video Love
     */
    onVideoLove(ms) {
        console.log('Video New Love', ms);
    }
    /**
       * On Video Not Love
       */
    onVideoNotLove(ms) {
        console.log('Video New Not Love', ms);
    }
    /**
       * On Video Favorite
       */
    onVideoFavorite(ms) {
        console.log('Video New Favorite', ms);
    }
    /**
     * Send Video New Action To Clinets Only For Thw Video Room Becuse Not Send To Users Play Target Video
     * @param videoId
     */
    static sendVideoAction(videoId, data) {
        this.socketServer.sockets.emit(`${socket_io_events_const_1.SocketIOEvents.videoMakeAction}/${videoId}`, data);
    }
    /**
     * Send This New  Laugage Id For Update In All Pages
     * @param videoId
     */
    static sendUserChangeLanugage(userId, data) {
        this.socketServer.sockets.emit(`${socket_io_events_const_1.SocketIOEvents.userChangeLanguage}/${userId}`, data);
    }
    /**
     * Send The Publish Post Right Now
     * @param videoId
     */
    static sendNewPostPublish(languageCodeTarget, data) {
        this.socketServer.sockets.emit(`${socket_io_events_const_1.SocketIOEvents.publishNewPost}/${languageCodeTarget}`, data);
    }
} //End Class
exports.SocketIOService = SocketIOService;
//# sourceMappingURL=socket.io.service.js.map