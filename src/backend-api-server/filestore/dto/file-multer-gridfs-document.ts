import {IFileMulterGridfsInfo} from "./file-multer-gridfs-info";
import {Document} from "mongoose";

export interface IFileMulterGridFsDocument extends IFileMulterGridfsInfo, Document {
    id: any
}
