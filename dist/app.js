"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const congif_const_1 = require("./consts/congif.const");
const user_router_1 = require("./routes/user.router");
const posts_router_1 = require("./routes/posts.router");
const contact_us_router_1 = require("./routes/contact.us.router");
const auth_guard_module_1 = require("./modules/auth.guard.module");
const mongodb_1 = require("mongodb");
const path_1 = require("path");
const videos_router_1 = require("./routes/videos.router");
const http = __importStar(require("http"));
const socket_io_service_1 = require("./services/socket.io.service");
//Add TMPDIR  For Upaldo Image In This, Then Rename File Uplaoded
process.env.TMPDIR = path_1.join(__dirname, "./files/temp/");
//reate Server From Expreess
const app = express_1.default();
const httpServer = new http.Server(app);
let db;
//Open Connection With DataBase
mongodb_1.MongoClient.connect(congif_const_1.config.mongoDataBaseUrl, { useUnifiedTopology: true }).then(_db => db = _db).catch(c => { throw "I Can Not Access To Data Base"; });
//For Parsing application/json And Set Linit To Request Body
app.use(express_1.default.urlencoded({
    extended: true
}));
app.use(express_1.default.json({ limit: '100mb' }));
//Set Defualt For Any Request 
app.use((req, res, next) => {
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
    res.locals[congif_const_1.config.db] = db;
    //Login 
    new auth_guard_module_1.AuthGuardModule(req, res).verifyAccessToken((loggenUserInfo, accessToken) => {
        //Fill Data To Response For Use In Next Function
        res.locals[congif_const_1.config.loggedUerInformation] = loggenUserInfo;
        res.locals[congif_const_1.config.loggedUerAccessToken] = accessToken;
        //Now Continue Working
        next();
    });
});
//Router Send File To Render In Browser
app.get('/files/:folderName/:fileName', (req, res) => {
    res.sendFile(path_1.join(__dirname, `./${req.url}`));
});
app.get('/', (req, res) => {
    res.write('Hello');
});
//Render User Routers
app.use('/api/user', user_router_1.userRouter);
//Render Post Routers
app.use('/api/post', posts_router_1.postsRouter);
//Render Contactus Routers
app.use('/api/contactUs', contact_us_router_1.contactUsRouter);
//Render Videos Routers
app.use('/api/video', videos_router_1.videosRouter);
/** Init Socket IO */
new socket_io_service_1.SocketIOService().init(httpServer);
httpServer.listen(congif_const_1.config.port, () => {
    console.log(`Server Working At ${congif_const_1.config.port} 
    http://localhost:${congif_const_1.config.port}`);
});
//# sourceMappingURL=app.js.map