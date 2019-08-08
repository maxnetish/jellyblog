import 'multer-gridfs-storage';
import {IFileMetadata} from "./file-metadata";

export interface IFileMulterGridfsInfo extends Express.Multer.File {
    metadata: IFileMetadata,
    url: string,
    // length instead of size. May be error in interface File definition
    length: number,
}
