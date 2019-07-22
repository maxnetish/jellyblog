import 'multer-gridfs-storage';
import {IFileMetadata} from "./file-metadata";

export interface IFileMulterGridfsInfo extends Express.Multer.File {
    metadata: IFileMetadata,
}
