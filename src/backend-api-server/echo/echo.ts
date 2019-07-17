import {routesMap} from './echo-routes-map';
import Router = require("koa-router");
import {IRouteController} from "../utils/api/route-controller";
import {Middleware} from "koa";
import {injectable} from "inversify";

@injectable()
export class EchoController implements IRouteController {

    private router = new Router();

    private echo: Middleware = (ctx) => {
        ctx.body = `Service up. User: ${JSON.stringify(ctx.state.user, null, 2)}`;
    };

    constructor() {
        this.router.get(routesMap.echo, this.echo);
    }

    getAllowedMethodsMiddleware(options?: Router.IRouterAllowedMethodsOptions): Middleware {
        return this.router.allowedMethods(options);
    }

    getRouteMiddleware(): Middleware {
        return this.router.routes();
    }
}

