import {IRequestWithPagination} from "../../utils/dto/request-with-pagination";

export interface IPostPublicFindCriteria extends IRequestWithPagination {
    from?: Date;
    to?: Date;
    q?: string;
    tag?: string;
}
