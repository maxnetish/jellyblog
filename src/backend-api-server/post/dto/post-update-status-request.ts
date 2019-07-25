import {IPostGetManyRequest} from "./post-get-many-request";
import {POST_STATUS} from "./post-status";

export interface IPostUpdateStatusRequest extends IPostGetManyRequest {
    status: POST_STATUS;
}
