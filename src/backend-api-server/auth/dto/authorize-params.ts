import {USER_ROLES} from "./user-roles";

export interface IAuthorizeParams {
    role?: USER_ROLES[];
    username?: string[];
}
