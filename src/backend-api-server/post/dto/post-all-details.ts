import {POST_STATUS} from "./post-status";
import {POST_ALLOW_READ} from "./post-allow-read";
import {POST_CONTENT_TYPE} from "./post-content-type";
import {IFileMulterGridfsInfo} from "../../filestore/dto/file-multer-gridfs-info";

export interface IPostAllDetails {
    _id: any;
    status: POST_STATUS;
    allowRead: POST_ALLOW_READ;
    createDate: Date;
    pubDate?: Date | null;
    updateDate: Date;
    author: string;
    contentType: POST_CONTENT_TYPE;
    title: string;
    brief?: string | null;
    content: string;
    tags: string[];
    titleImg?: string | null;
    attachments: string[];
    hru?: string | null;
    url: string;
}
