import {IRouteController} from "../../utils/api/route-controller";
import Router = require('koa-router');
import {routesMap} from './koa-routes-map';
import {Middleware} from "koa";
import {inject, injectable} from "inversify";
import {TYPES} from "../../ioc/types";
import {IJoiValidationMiddlewareFactory} from "../../utils/api/joi-validation-middleware";
import {IUserAuthorizeMiddlewareFactory} from "../../auth/api/user-authorize-middleware-factory";
import {ILogService} from "../api/log-service";
import {logFindEntriesCriteriaSchema} from "../dto/log-find-entries-criteria.schema";
import {ILogFindEntriesCriteria} from "../dto/log-find-entries-criteria";
import {IUserContext} from "../../auth/api/user-context";

@injectable()
export class LogController implements IRouteController {

    private readonly router = new Router({
        prefix: routesMap.prefix
    });

    private readonly logService: ILogService;

    private findLogEntries: Middleware = async ctx => {
        const criteria: ILogFindEntriesCriteria = ctx.state.query || {};
        const userContext: IUserContext = ctx.state.user;
        const result = await this.logService.findEntries(criteria, {user: userContext});
        ctx.body = result;
    };

    constructor(
        @inject(TYPES.LogService) logService: ILogService,
        @inject(TYPES.JoiValidationMiddlewareFactory) joiValidationMiddlewareFactory: IJoiValidationMiddlewareFactory,
        @inject(TYPES.UserAuthorizeMiddlewareFactory) userAuthorizeMiddleware: IUserAuthorizeMiddlewareFactory,
    ) {
        this.logService = logService;
        this.router.get(
            routesMap["log-get"],
            joiValidationMiddlewareFactory({query: logFindEntriesCriteriaSchema}),
            userAuthorizeMiddleware([{role: ['admin']}]),
            this.findLogEntries,
        );
    }

    getAllowedMethodsMiddleware(options?: Router.IRouterAllowedMethodsOptions): Middleware {
        return this.router.allowedMethods(options);
    }

    getRouteMiddleware(): Middleware {
        return this.router.routes();
    }

}
