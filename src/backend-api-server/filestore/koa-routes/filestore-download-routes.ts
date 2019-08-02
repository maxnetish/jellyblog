import {IRouteController} from "../../utils/api/route-controller";
import Router = require("koa-router");
import {Middleware} from "koa";
import {injectable} from "inversify";

@injectable()
export class FileStoreDownloadController implements IRouteController {

    private readonly router = new Router({
        prefix: process.env.JB_GRIDFS_BASEURL || '/file',
    });

    constructor(){

    }

    getAllowedMethodsMiddleware(options?: Router.IRouterAllowedMethodsOptions): Middleware {
        return this.router.allowedMethods(options);
    }

    getRouteMiddleware(): Middleware {
        return this.router.routes();
    }

}
