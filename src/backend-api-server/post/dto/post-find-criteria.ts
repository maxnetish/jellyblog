import {IRequestWithPagination} from "../../utils/dto/request-with-pagination";
import {POST_STATUS} from "./post-status";

export interface IPostFindCriteria extends IRequestWithPagination {
    from?: Date;
    to?: Date;
    q?: string;
    statuses?: POST_STATUS[];
    ids?: string[];
}
