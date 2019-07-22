import {IRequestWithPagination} from "../dto/request-with-pagination";

export interface IPaginationUtils {
    skipLimitFromPaginationRequest(request: IRequestWithPagination): { skip: number; limit: number; page: number;};
}
