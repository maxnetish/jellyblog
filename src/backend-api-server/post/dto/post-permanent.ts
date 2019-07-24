import {POST_STATUS} from "./post-status";
import {POST_ALLOW_READ} from "./post-allow-read";
import {POST_CONTENT_TYPE} from "./post-content-type";

// for export-import
export interface IPostPermanent {
    _id?: string;
    status: POST_STATUS;
    allowRead: POST_ALLOW_READ;
    createDate?: Date;
    pubDate?: Date | null;
    updateDate?: Date;
    contentType: POST_CONTENT_TYPE;
    title: string;
    brief?: string | null;
    content: string;
    tags: string[];
    titleImg?: string;
    attachments: string[];
    hru?: string | null;
    url: string;
}
