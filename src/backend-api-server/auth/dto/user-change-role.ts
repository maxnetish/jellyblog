import {USER_ROLES} from "./user-roles";

export interface IUserChangeRole {
    username: string,
    role: USER_ROLES,
}
