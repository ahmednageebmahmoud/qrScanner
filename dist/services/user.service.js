"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
const congif_const_1 = require("../consts/congif.const");
class UserService {
    /**
     * Get Valid User Picture Path
     */
    static getUserPicturePath(usre) {
        if (usre.picturePath) {
            if (!usre.isGoogelPicture)
                usre.picturePath = congif_const_1.config.apiFullPath + usre.picturePath;
        }
        else {
            usre.picturePath = congif_const_1.config.apiFullPath + "/files/users/default.png";
        }
        return usre.picturePath;
    }
} //End Class
exports.UserService = UserService;
//# sourceMappingURL=user.service.js.map