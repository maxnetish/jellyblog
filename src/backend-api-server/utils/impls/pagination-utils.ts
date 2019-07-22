import {IPaginationUtils} from "../api/pagination-utils";
import {IRequestWithPagination} from "../dto/request-with-pagination";
import {injectable} from "inversify";

@injectable()
export class PaginationUtils implements IPaginationUtils {
    private itemsPerPage = parseInt(process.env.DB_DEFAULT_PAGINATION || '10', 10) || 10;

    skipLimitFromPaginationRequest(request: IRequestWithPagination): { skip: number; limit: number; page: number; } {
        let {page} = request;
        page = page || 1;
        return {
            skip: this.itemsPerPage * (page - 1),
            limit: this.itemsPerPage,
            page,
        };
    }
}
