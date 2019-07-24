import {IPostCreateRequest} from "./post-create-request";

export interface IPostUpdateRequest extends IPostCreateRequest {
    _id: string;
}
