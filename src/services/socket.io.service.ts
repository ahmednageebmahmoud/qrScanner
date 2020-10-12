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
        console.log('I Will Init');
        
        const socketIOServer = socketIO(httpServer, {
            cookie: false,
            //   origins:config.websiteUrl//<< Web Site Target
        });
        //On Connect Event
        socketIOServer.on("connect", this.onConnect);
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
        * Send This New User Information For Update In All Pages 
        * @param videoId 
        */
    static sendNewUserInformation(userId: ObjectId , data: ISocketResponse): void {
        this.socketServer.sockets.emit(`${SocketIOEvents.userUpdatedInformation}/${userId}`, data);
    }


    /**
     * Send The Publish Post Right Now
     * @param videoId 
     */
    static sendNewPostPublish(languageCodeTarget: string, data: ISocketResponse): void {
        this.socketServer.sockets.emit(`${SocketIOEvents.publishNewPost}/${languageCodeTarget}`, data);
    }


    /** Tell All Pages To Log Out  To Spscif User */

    static userLoggedOut(userId: ObjectId): void {
        this.socketServer.sockets.emit(`${SocketIOEvents.userLoggedOut}/${userId}`);
    }
    




}//End Class