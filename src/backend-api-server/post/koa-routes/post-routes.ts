import {IRouteController} from "../../utils/api/route-controller";
import Router = require('koa-router');
import {routesMap} from "./post-routes-map";
import {Middleware} from "koa";
import {IPostService} from "../api/post-service";
import {inject, injectable} from "inversify";
import {IJoiValidationMiddlewareFactory} from "../../utils/api/joi-validation-middleware";
import {TYPES} from "../../ioc/types";
import {postCreateRequestSchema} from "../dto/post-create-request.schema";
import {IUserAuthorizeMiddlewareFactory} from "../../auth/api/user-authorize-middleware-factory";
import {IPostCreateRequest} from "../dto/post-create-request";
import {IUserContext} from "../../auth/api/user-context";
import {IPostUpdateRequest} from "../dto/post-update-request";
import {postUpdateRequestSchema} from "../dto/post-update-request.schema";
import {postExportRequestSchema} from "../dto/post-export-request.schema";
import {postGetRequestSchema} from "../dto/post-get-request.schema";
import {IPostGetRequest} from "../dto/post-get-request";
import {postPermanentSchema} from "../dto/post-permanent.schema";
import {PostExportRequest} from "../dto/post-export-request";
import {postImportRequestSchema} from "../dto/post-import-request.schema";
import {IPostImportRequest} from "../dto/post-import-request";

@injectable()
export class PostController implements IRouteController {

    private readonly router = new Router({
        prefix: routesMap.prefix
    });

    private postService: IPostService;

    private createPost: Middleware = async ctx => {
        const postCreateRequest: IPostCreateRequest = ctx.request.body;
        const userContext: IUserContext = ctx.state.user;
        const postDetails = await this.postService.createPost(postCreateRequest, {user: userContext});
        ctx.body = postDetails;
    };

    private updatePost: Middleware = async ctx => {
        const postUpdateRequest: IPostUpdateRequest = ctx.request.body;
        const userContext: IUserContext = ctx.state.user;
        const postDetails = await this.postService.updatePost(postUpdateRequest, {user: userContext});
        ctx.body = postDetails;
    };

    private exportPosts: Middleware = async ctx => {
        const postExportRequest: PostExportRequest = ctx.request.body;
        const userContext: IUserContext = ctx.state.user;
        const result = await this.postService.exportPosts(postExportRequest, {user: userContext});
        ctx.body = result;
    };

    private getPost: Middleware = async ctx => {
        const postGetRequest: IPostGetRequest = ctx.state.query;
        const userContext: IUserContext = ctx.state.user;
        const result = await this.postService.getPost(postGetRequest, {user: userContext});
        ctx.body = result;
    };

    private importPosts: Middleware = async ctx => {
        const postsImportReqeust: IPostImportRequest = ctx.state.query;
        const userContext: IUserContext = ctx.state.user;
        const result = this.postService.importPosts(postsImportReqeust, {user: userContext});
        ctx.body = result;
    };

    constructor(
        // add IPostService inject
        @inject(TYPES.JoiValidationMiddlewareFactory) joiValidateMiddlewareFactory: IJoiValidationMiddlewareFactory,
        @inject(TYPES.UserAuthorizeMiddlewareFactory) userAuthorizeMiddlewareFactory: IUserAuthorizeMiddlewareFactory,
    ) {
        this.router.post(
            routesMap["post-get-create-or-update"],
            joiValidateMiddlewareFactory({body: postCreateRequestSchema}),
            userAuthorizeMiddlewareFactory([{role: ['admin']}]),
            this.createPost,
        );
        this.router.put(
            routesMap["post-get-create-or-update"],
            joiValidateMiddlewareFactory({body: postUpdateRequestSchema}),
            userAuthorizeMiddlewareFactory([{role: ['admin']}]),
            this.updatePost,
        );
        this.router.post(
            routesMap.export,
            joiValidateMiddlewareFactory({body: postExportRequestSchema}),
            userAuthorizeMiddlewareFactory([{role: ['admin']}]),
            this.exportPosts,
        );
        this.router.get(
            routesMap["post-get-create-or-update"],
            joiValidateMiddlewareFactory({query: postGetRequestSchema}),
            userAuthorizeMiddlewareFactory([{role: ['admin']}]),
            this.getPost,
        );
        this.router.get(
            routesMap.import,
            joiValidateMiddlewareFactory({query: postImportRequestSchema}),
            userAuthorizeMiddlewareFactory([{role: ['admin']}]),
            this.importPosts
        );
    }

    getAllowedMethodsMiddleware(options?: Router.IRouterAllowedMethodsOptions): Middleware {
        return this.router.allowedMethods(options);
    }

    getRouteMiddleware(): Middleware {
        return this.router.routes();
    }

}
