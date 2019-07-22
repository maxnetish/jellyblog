import {IRequestWithPagination} from "../../utils/dto/request-with-pagination";

export interface IFileFindCriteria extends IRequestWithPagination{
    context?: string;
    withoutPostId?: boolean;
    postId?: string;
    contentType?: string;
    dateTo?: Date;
    dateFrom?: Date;
}
