import {IAuthorizeParams} from "../dto/authorize-params";
import {IUserContext} from "../api/user-context";
import {IUserAuthorizeMiddlewareFactory} from "../api/user-authorize-middleware-factory";

export const userAuthorizeMiddlewareFactory: IUserAuthorizeMiddlewareFactory =
    (required: IAuthorizeParams[] | 'ANY', toThrow?: number | string | { message?: string, status?: string, statusCode?: number }) => {
        return async (ctx, next) => {
            const userContext: IUserContext = ctx.state.user;
            userContext.assertAuth(required, toThrow);
            await next();
        };
    };
