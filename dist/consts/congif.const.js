"use strict";
var _a, _b;
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
exports.config = {
    port: ((_a = process.env) === null || _a === void 0 ? void 0 : _a.port) || 2524,
    db: "dataaBase",
    loggedUerInformation: "loggedUerInformation",
    loggedUerAccessToken: "loggedUerAccessToken",
    mongoDataBaseUrl: "mongodb://127.0.0.1:27017/posty5",
    apiFullPath: "http://www.localhost:" + (((_b = process.env) === null || _b === void 0 ? void 0 : _b.port) || 2524),
    websiteUrl: "http://localhost:4200",
    googelOAuth2ClientClinetId: "610924539803-jp51binjkoh9qlja2k2l6or1t2i83t86.apps.googleusercontent.com",
    googelOAuth2ClientSecretId: "2Gr5j5E9N63Dto4bf-ZnDR_d",
};
//Freeze
Object.freeze(exports.config);
//# sourceMappingURL=congif.const.js.map