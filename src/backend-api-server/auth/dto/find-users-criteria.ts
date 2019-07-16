import {USER_ROLES} from "./user-roles";
import {IRequestWithPagination} from "../../utils/request-with-pagination";

export interface IFindUsersCriteria extends IRequestWithPagination {
    username?: string | RegExp,
    role?: USER_ROLES[],
}

export function findUserCriteriaAssertValidate(findUsersCriteria: any, toThrow: number = 400) {
    if (!(findUsersCriteria &&
        (!findUsersCriteria.username || findUsersCriteria.username.length < 32) &&
        (!findUsersCriteria.role || findUsersCriteria.role.length < 8))) {
        throw toThrow;
    }
}

export function findUserCriteriaFromRequest(findUserCriteria: any): IFindUsersCriteria {
    findUserCriteria = findUserCriteria || {};
    const {role, username, page} = findUserCriteria;

    return {
        role: Array.isArray(role) ?
            role.map(r => (r + '') as USER_ROLES) :
            (role ?
                [(role + '') as USER_ROLES] :
                undefined),
        username: username ? username + '' : undefined,
        page: parseInt(page, 10),
    };
}
