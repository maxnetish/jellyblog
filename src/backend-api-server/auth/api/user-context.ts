import {IUserInfo} from "../dto/user-info";
import {IAuthorizeParams} from "../dto/authorize-params";

export interface IUserContextFactory {
    (userInfo?: IUserInfo): IUserContext;
}

export interface IUserContext extends Readonly<IUserInfo> {
    readonly authenticated: boolean;

    assertAuth(required: IAuthorizeParams[] | 'ANY', toThrow?: number | string | { message?: string, status?: string, statusCode?: number }): void;
}
