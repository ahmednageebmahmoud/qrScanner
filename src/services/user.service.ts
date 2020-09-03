import { userInfo } from "os";
import { UserModel } from "../models/user.model";
import { config } from "../consts/congif.const";

export class UserService {
    /**
     * Get Valid User Picture Path
     */
    static getUserPicturePath(usre: UserModel) {
        if (usre.picturePath) {
            if (!usre.isGoogelPicture)
                usre.picturePath = config.apiFullPath + usre.picturePath;
        }
        else {
            usre.picturePath = config.apiFullPath + "/files/users/default.png";

        }
        return usre.picturePath;
    }
}//End Class