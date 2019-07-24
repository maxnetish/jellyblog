import {POST_STATUS} from "./post-status";
import {POST_ALLOW_READ} from "./post-allow-read";
import {POST_CONTENT_TYPE} from "./post-content-type";

export interface IPostCreateRequest {
    status: POST_STATUS;
    allowRead: POST_ALLOW_READ;
    contentType: POST_CONTENT_TYPE;
    title: string;
    brief?: string | null;
    content: string;
    tags: string[];
    /**
     * ref to File collection
     */
    titleImg?: string;
    /**
     * refs to FIle collection
     */
    attachments: string[];
    hru?: string | null;
}
