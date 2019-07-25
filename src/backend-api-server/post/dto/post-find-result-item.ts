import {POST_STATUS} from "./post-status";
import {IFileMulterGridfsInfo} from "../../filestore/dto/file-multer-gridfs-info";

export interface IPostFindResultItem {
    _id: any;
    status: POST_STATUS;
    createDate: Date;
    updateDate: Date;
    pubDate?: Date | null;
    titleImg?: IFileMulterGridfsInfo | null;
    title: string;
    brief?: string | null;
}
