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
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileService = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
class FileService {
    //Save File In Server
    /**
     * Save File In The Server
     * @param fileSaveingModel Folders Names After /files/<Youre Folder Name Heere>
     * @param foldersNames
     */
    static saveFileSync(fileSaveingModel, ...foldersNames) {
        try {
            let imageDecoded = Buffer.from(fileSaveingModel.base64, 'base64');
            let dateTimeNow = Date.now();
            let savedFilePath = `/files/${foldersNames.join("/")}/${dateTimeNow}_${fileSaveingModel.fileName}`;
            //Save New Image
            fs.writeFileSync(path.join(__dirname, `../${savedFilePath}`), imageDecoded);
            return savedFilePath;
        }
        catch (error) {
            return null;
        }
    }
    /**
     * Remove File From Server
     * @param filePath
     */
    static removeFiles(...filePath) {
        if (!filePath)
            return;
        filePath.forEach(pa => {
            fs.unlink(path.join(__dirname, `../${pa}`), (errorRemoveImage) => { });
        });
    }
} //End Class
exports.FileService = FileService;
//# sourceMappingURL=file.services.js.map