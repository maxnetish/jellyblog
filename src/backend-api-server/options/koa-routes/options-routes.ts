import {IRouteController} from "../../utils/api/route-controller";
import {inject, injectable} from "inversify";
import Router = require('koa-router');
import {routesMap} from "./options-routes-map";
import {Middleware} from "koa";
import {IOptionsService} from "../api/options-service";
import {TYPES} from "../../ioc/types";
import {IJoiValidationMiddlewareFactory} from "../../utils/api/joi-validation-middleware";
import {IUserAuthorizeMiddlewareFactory} from "../../auth/api/user-authorize-middleware-factory";
import {optionsRobotsTxtSchema} from "../dto/options-robots-txt.schema";

@injectable()
export class OptionsController implements IRouteController {
    private readonly router = new Router({
        prefix: routesMap.prefix
    });

    // TODO add implementation
    private optionsService: IOptionsService;

    private getRobotsTxt: Middleware = async ctx => {
        // allow for admin
        // CRUD route, content for robots.txt have to be request from another path
        const userContext = ctx.state.user;
        const optionsRobotsTxt = await this.optionsService.getRobotsTxt({user: userContext});
        ctx.body = optionsRobotsTxt;
    };

    private getRobotsTxtContent: Middleware = async ctx => {
        // PUB method
        const optionsRobotsTxtContent = await this.optionsService.getRobotsTxtContent();
        ctx.body = {
            content: optionsRobotsTxtContent
        };
    };

    private createOrUpdateRobotsTxt: Middleware = async ctx => {
        const userContext = ctx.state.user;
        const robotsTxtRequest = ctx.request.body;
        const result = await this.optionsService.createOrUpdateRobotsTxt(robotsTxtRequest, {user: userContext});
        ctx.body = result;
    };

    constructor(
        @inject(TYPES.OptionsService) optionsService: IOptionsService,
        @inject(TYPES.JoiValidationMiddlewareFactory) joiValidationMiddlewareFactory: IJoiValidationMiddlewareFactory,
        @inject(TYPES.UserAuthorizeMiddlewareFactory) userAuthorizeMiddleware: IUserAuthorizeMiddlewareFactory,
    ) {
        this.optionsService = optionsService;
        this.router.get(
            routesMap["robots-txt"],
            userAuthorizeMiddleware([{role: ['admin']}]),
            this.getRobotsTxt,
        );
        this.router.get(
            routesMap["robots-txt-content"],
            this.getRobotsTxtContent,
        );
        this.router.post(
            routesMap["robots-txt"],
            joiValidationMiddlewareFactory({body: optionsRobotsTxtSchema}),
            userAuthorizeMiddleware([{role: ['admin']}]),
            this.createOrUpdateRobotsTxt,
        );
    }

    getAllowedMethodsMiddleware(options?: Router.IRouterAllowedMethodsOptions): Middleware {
        return this.router.allowedMethods(options);
    }

    getRouteMiddleware(): Middleware {
        return this.router.routes();
    }

}