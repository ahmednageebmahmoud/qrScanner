import socketIO, { Socket } from "socket.io";
import { SocketIOEvents } from "../consts/socket.io.events.const";
import { ISocketResponse } from "../interfaces/i.socket.response";
import { Server } from "http";
import { config } from "../consts/congif.const";
import { ObjectId } from "mongodb";
export class SocketIOService {

    /** 
     * Current Socket
     */
    static socketServer: SocketIO.Server;

    /** Init Socet Io  */
    init(httpServer: Server): void {
        const socketIOServer = socketIO(httpServer, {
            cookie: false,
            //   origins:config.websiteUrl//<< Web Site Target
        });
        //On Connect Event
        //socketIOServer.on("connect", this.onConnect);
        SocketIOService.socketServer = socketIOServer;
    }

    /** On New User Connected */
    private onConnect(soc: Socket): void {
        console.log('New User Connected');

        //Init Events Now
        //soc.on(SocketIOEvents.video_love, this.onVideoLove);
        //soc.on(SocketIOEvents.video_notLove, this.onVideoNotLove);
        //soc.on(SocketIOEvents.video_favorite, this.onVideoFavorite);
    }

    /** 
     * On Video Love
     */
    private onVideoLove(ms: ISocketResponse): void {
        console.log('Video New Love', ms);
    }
    /** 
       * On Video Not Love
       */
    private onVideoNotLove(ms: ISocketResponse): void {
        console.log('Video New Not Love', ms);
    }
    /** 
       * On Video Favorite
       */
    private onVideoFavorite(ms: ISocketResponse): void {
        console.log('Video New Favorite', ms);
    }

    /**
     * Send Video New Action To Clinets Only For Thw Video Room Becuse Not Send To Users Play Target Video
     * @param videoId 
     */
    static sendVideoAction(videoId: string, data: ISocketResponse): void {
        this.socketServer.sockets.emit(`${SocketIOEvents.videoMakeAction}/${videoId}`, data);
    }


    /**
     * Send This New  Laugage Id For Update In All Pages 
     * @param videoId 
     */
    static sendUserChangeLanugage(userId: ObjectId, data: ISocketResponse): void {
        this.socketServer.sockets.emit(`${SocketIOEvents.userChangeLanguage}/${userId}`, data);
    }


    /**
     * Send The Publish Post Right Now
     * @param videoId 
     */
    static sendNewPostPublish(languageCodeTarget: string, data: ISocketResponse): void {
        this.socketServer.sockets.emit(`${SocketIOEvents.publishNewPost}/${languageCodeTarget}`, data);
    }


}//End Class