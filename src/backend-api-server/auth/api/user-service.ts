import {ICredentials} from "../dto/credentials";
import {IUserInfo} from "../dto/user-info";
import {IWithUserContext} from "../dto/with-user-context";
import {IUserNewPassword} from "../dto/user-new-password";
import {IUserCreateNew} from "../dto/user-create-new";
import {IFindUsersCriteria} from "../dto/find-users-criteria";
import {IResponseWithPagination} from "../../utils/dto/response-with-pagination";
import {IUserChangeRole} from "../dto/user-change-role";

export interface IUserService {
    findUserInfoByCredentials(credentials: ICredentials): Promise<IUserInfo | null>;
    findUserInfoByUsername(name: string, options: IWithUserContext): Promise<IUserInfo | null>;
    changePassword(userNewPassword: IUserNewPassword, options: IWithUserContext): Promise<boolean>;
    changeRole(userChangeRole: IUserChangeRole, options: IWithUserContext): Promise<boolean>;
    addUser(userCreateNew: IUserCreateNew, options: IWithUserContext): Promise<IUserInfo>;
    removeUser(username: string, options: IWithUserContext): Promise<boolean>;
    findUsers(findUsersCriteria: IFindUsersCriteria, options: IWithUserContext): Promise<IResponseWithPagination<IUserInfo>>;
}
