import * as fs from 'fs';
import * as path from "path";
import { FileSaveingModel } from '../models/file.saveing.model';

export class FileService {
    //Save File In Server
    /**
     * Save File In The Server
     * @param fileSaveingModel Folders Names After /files/<Youre Folder Name Heere>
     * @param foldersNames 
     */
    static saveFileSync(fileSaveingModel: FileSaveingModel, ...foldersNames: string[]): string {
        try {
            let imageDecoded: Buffer = Buffer.from(fileSaveingModel.base64, 'base64');
            let dateTimeNow: number = Date.now();
            let savedFilePath = `/files/${foldersNames.join("/")}/${dateTimeNow}_${fileSaveingModel.fileName}`;

            
            //Save New Image
            fs.writeFileSync(path.join(__dirname, `../${savedFilePath}`), imageDecoded);

            return savedFilePath;
        } catch (error) {
            return null;
        }
    }


    /**
     * Remove File From Server
     * @param filePath 
     */
    static removeFiles(...filePath: string[]): void {
        if (!filePath) return;
        filePath.forEach(pa => {
            fs.unlink(path.join(__dirname, `../${pa}`), (errorRemoveImage) => { });
        });
    }


}//End Class