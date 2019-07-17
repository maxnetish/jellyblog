import {IMiddleware, IRouterAllowedMethodsOptions} from "koa-router";

export interface IRouteController {
    getRouteMiddleware(): IMiddleware;
    getAllowedMethodsMiddleware(options?: IRouterAllowedMethodsOptions): IMiddleware;
}
