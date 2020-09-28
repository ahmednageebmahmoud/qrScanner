import expres, { Application, NextFunction, Request, Response } from "express";
import { config } from "./consts/congif.const";
import { userRouter } from "./routes/user.router";
import { postsRouter } from "./routes/posts.router";
import { contactUsRouter } from "./routes/contact.us.router";
import { AuthGuardModule } from "./modules/auth.guard.module";
import { MongoClient } from "mongodb";
import { LoggedUserInformation } from "./models/logged.user.information";
import { join } from "path";
import fs from "fs";
import { videosRouter } from "./routes/videos.router";
import * as http from "http";
import { SocketIOService } from "./services/socket.io.service";
//Add TMPDIR  For Upaldo Image In This, Then Rename File Uplaoded
process.env.TMPDIR = join(__dirname, "./files/temp/");


//reate Server From Expreess
const app: Application = expres();
const httpServer = new http.Server(app);
let db: MongoClient;

//Open Connection With DataBase
MongoClient.connect(config.mongoDataBaseUrl, { useUnifiedTopology: true }).then(_db => db = _db).catch(c => { throw "I Can Not Access To Data Base" });


//For Parsing application/json And Set Linit To Request Body
app.use(expres.urlencoded({
  extended: true
}));
app.use(expres.json({ limit: '100mb' }));

//Set Defualt For Any Request 
app.use((req: Request, res: Response, next: NextFunction) => {

  // Website you wish to allow to connect
  res.setHeader('Access-Control-Allow-Origin', '*');

  // Request methods you wish to allow
  res.setHeader('Access-Control-Allow-Methods', '*');

  // Request headers you wish to allow
  res.setHeader('Access-Control-Allow-Headers', '*');

  // var geoip = require('geoip-lite');
 
  // var ip = "207.97.227.239";
  // var geo = geoip.lookup(ip);
  // console.log(geo);
  
  

  // Set to true if you need the website to include cookies in the requests sent
  // to the API (e.g. in case you use sessions)
  //   res.setHeader('Access-Control-Allow-Credentials', true);

  //Pass DB To Locla 
  res.locals[config.db] = db;
  //Login 
  new AuthGuardModule(req, res).verifyAccessToken((loggenUserInfo: LoggedUserInformation, accessToken: string) => {

    //Fill Data To Response For Use In Next Function
    res.locals[config.loggedUerInformation] = loggenUserInfo;
    res.locals[config.loggedUerAccessToken] = accessToken;
    //Now Continue Working
    next();
  });
});



//Router Send File To Render In Browser
app.get('/files/:folderName/:fileName', (req: Request, res: Response) => {
  res.sendFile(join(__dirname, `./${req.url}`))
});

app.get('/',(req,res)=>{
  res.write('Hello')
})

//Render User Routers
app.use('/api/user',userRouter);
//Render Post Routers
app.use('/api/post',postsRouter);
//Render Contactus Routers
app.use('/api/contactUs',contactUsRouter);
//Render Videos Routers
app.use('/api/video',videosRouter);

/** Init Socket IO */
new SocketIOService().init(httpServer);





httpServer.listen(config.port, () => {
  console.log(`Server Working At ${config.port} 
    http://localhost:${config.port}`);
});