import {IAuthorizeParams} from "../dto/authorize-params";
import {Middleware} from "koa";

export interface IUserAuthorizeMiddlewareFactory {
    (required: IAuthorizeParams[] | 'ANY', toThrow?: number | string | { message?: string, status?: string, statusCode?: number }): Middleware
}
