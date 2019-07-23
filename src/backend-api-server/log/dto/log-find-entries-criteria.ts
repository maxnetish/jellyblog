import {IRequestWithPagination} from "../../utils/dto/request-with-pagination";

export interface ILogFindEntriesCriteria extends IRequestWithPagination {
    err?: boolean,
    dateTo?: Date,
    dateFrom?: Date,
}
