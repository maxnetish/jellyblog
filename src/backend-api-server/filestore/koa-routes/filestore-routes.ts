import {IRouteController} from "../../utils/api/route-controller";
import Router = require('koa-router');
import {routesMap} from "./filestore-routes-map";
import {IFileService} from "../api/file-service";
import {inject, injectable} from "inversify";
import {TYPES} from "../../ioc/types";
import {IJoiValidationMiddlewareFactory} from "../../utils/api/joi-validation-middleware";
import {IUserAuthorizeMiddlewareFactory} from "../../auth/api/user-authorize-middleware-factory";
import {fileFindCriteriaSchema} from "../dto/file-find-criteria.schema";
import {Middleware} from "koa";
import {IFileFindCriteria} from "../dto/file-find-criteria";
import {IUserContext} from "../../auth/api/user-context";
import {IFileRemoveRequest} from "../dto/file-remove-request";
import {fileRemoveRequestSchema} from "../dto/file-remove-request.schema";

@injectable()
export class FileStoreController implements IRouteController {

    private readonly router = new Router({
        prefix: routesMap.prefix
    });

    private fileService: IFileService;

    private fileFind: Middleware = async ctx => {
        const fileFindCriteria: IFileFindCriteria = ctx.state.query;
        const userContext: IUserContext = ctx.state.user;
        const result = await this.fileService.find(fileFindCriteria, {user: userContext});
        ctx.body = result;
    };

    private fileRemove: Middleware = async ctx => {
        const fileRemoveRequest: IFileRemoveRequest = ctx.request.body;
        const userContext: IUserContext = ctx.state.user;
        const result = await this.fileService.remove(fileRemoveRequest, {user: userContext});
        ctx.status = result ? 204 : 403;
    };

    constructor(
        @inject(TYPES.JoiValidationMiddlewareFactory) joiValidationMiddlewareFactory: IJoiValidationMiddlewareFactory,
        @inject(TYPES.UserAuthorizeMiddlewareFactory) userAuthorizeMiddleware: IUserAuthorizeMiddlewareFactory,
        @inject(TYPES.FileService) fileService: IFileService,
    ) {
        this.fileService = fileService;
        this.router.get(
            routesMap["file-find"],
            joiValidationMiddlewareFactory({query: fileFindCriteriaSchema}),
            userAuthorizeMiddleware([{role: ['admin']}]),
            this.fileFind,
        );
        this.router.delete(
            routesMap["file-remove"],
            joiValidationMiddlewareFactory({body: fileRemoveRequestSchema}),
            userAuthorizeMiddleware([{role: ['admin']}]),
            this.fileRemove,
        )
    }

    getAllowedMethodsMiddleware(options?: Router.IRouterAllowedMethodsOptions): Middleware {
        return this.router.allowedMethods(options);
    }

    getRouteMiddleware(): Middleware {
        return this.router.routes();
    }

}
