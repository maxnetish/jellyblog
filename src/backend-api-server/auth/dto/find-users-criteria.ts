import {USER_ROLES} from "./user-roles";
import {IRequestWithPagination} from "../../utils/dto/request-with-pagination";

export interface IFindUsersCriteria extends IRequestWithPagination {
    username?: string | RegExp,
    role?: USER_ROLES[],
}
