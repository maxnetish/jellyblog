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
// import {IUserContext} from "../../auth/api/user-context";
import {IPostUpdateRequest} from "../dto/post-update-request";
import {postUpdateRequestSchema} from "../dto/post-update-request.schema";
import {postExportRequestSchema} from "../dto/post-export-request.schema";
import {postGetByObjectidRequestSchema} from "../dto/post-get-by-objectid-request.schema";
import {IPostGetByObjectidRequest} from "../dto/post-get-by-objectid-request";
import {PostExportRequest} from "../dto/post-export-request";
import {postGetManyRequestSchema} from "../dto/post-get-many-request.schema";
import {IPostGetManyRequest} from "../dto/post-get-many-request";
import {IPostFindCriteria} from "../dto/post-find-criteria";
import {postFindCriteriaSchema} from "../dto/post-find-criteria.schema";
import {IPostUpdateStatusRequest} from "../dto/post-update-status-request";
import {postUpdateStatusRequestSchema} from "../dto/post-update-status-request.schema";
import {IPostPublicFindCriteria} from "../dto/post-public-find-criteria";
import {postPublicFindCriteriaSchema} from "../dto/post-public-find-crieria.schema";
import {postGetRequestSchema} from "../dto/post-get-request.schema";
import {IPostGetRequest} from "../dto/post-get-request";
import {ITagListRequest} from "../dto/tag-list-request";
import {tagListRequestSchema} from "../dto/tag-list-request.schema";

@injectable()
export class PostController implements IRouteController {

    private readonly router = new Router({
        prefix: routesMap.prefix
    });

    private postService: IPostService;

    private createPost: Middleware = async ctx => {
        const postCreateRequest: IPostCreateRequest = ctx.request.body;
        const userContext = ctx.state.user;
        const postDetails = await this.postService.createPost(postCreateRequest, {user: userContext});
        ctx.body = postDetails;
    };

    private updatePost: Middleware = async ctx => {
        const postUpdateRequest: IPostUpdateRequest = ctx.request.body;
        const userContext = ctx.state.user;
        const postDetails = await this.postService.updatePost(postUpdateRequest, {user: userContext});
        ctx.body = postDetails;
    };

    private exportPosts: Middleware = async ctx => {
        const postExportRequest: PostExportRequest = ctx.request.body;
        const userContext = ctx.state.user;
        const result = await this.postService.exportPosts(postExportRequest, {user: userContext});
        ctx.body = result;
    };

    private getPost: Middleware = async ctx => {
        const postGetRequest: IPostGetByObjectidRequest = ctx.state.query;
        const userContext = ctx.state.user;
        const result = await this.postService.getPost(postGetRequest, {user: userContext});
        ctx.body = result;
    };

    private importPosts: Middleware = async ctx => {
        const postsImportReqeust: IPostGetManyRequest = ctx.state.query;
        const userContext = ctx.state.user;
        const result = await this.postService.importPosts(postsImportReqeust, {user: userContext});
        ctx.body = result;
    };

    private findPosts: Middleware = async ctx => {
        const postFindCriteria: IPostFindCriteria = ctx.state.query;
        const userContext = ctx.state.user;
        const result = await this.postService.find(postFindCriteria, {user: userContext});
        ctx.body = result;
    };

    private getPostForPublic: Middleware = async ctx => {
        const postGetCriteria: IPostGetRequest = ctx.state.query;
        const userContext = ctx.state.user;
        const result = await this.postService.publicGet(postGetCriteria, {user: userContext});
        ctx.body = result;
    };

    private updateStatus: Middleware = async ctx => {
        const postUpdateStatusRequest: IPostUpdateStatusRequest = ctx.request.body;
        const userContext = ctx.state.user;
        const result = await this.postService.updateStatus(postUpdateStatusRequest, {user: userContext});
        ctx.body = result;
    };

    private findPostsForPublic: Middleware = async ctx => {
        const postPublicFindCriteria: IPostPublicFindCriteria = ctx.state.query;
        const userContext = ctx.state.user;
        const result = await this.postService.publicFind(postPublicFindCriteria, {user: userContext});
        ctx.body = result;
    };

    private remove: Middleware = async ctx => {
        const postGetManyRequest: IPostGetManyRequest = ctx.request.body;
        const userConetxt = ctx.state.user;
        const result = await this.postService.remove(postGetManyRequest, {user: userConetxt});
        ctx.body = result;
    };

    private getTags: Middleware = async ctx => {
        const tagListRequest: ITagListRequest = ctx.state.query;
        const userContext = ctx.state.user;
        const result = await this.postService.getTags(tagListRequest, {user: userContext});
        ctx.body = result;
    };

    private getSitemap: Middleware = async ctx => {
        const result = await this.postService.generateSitemap();
        ctx.body = result;
    };

    constructor(
        @inject(TYPES.PostService) postService: IPostService,
        @inject(TYPES.JoiValidationMiddlewareFactory) joiValidateMiddlewareFactory: IJoiValidationMiddlewareFactory,
        @inject(TYPES.UserAuthorizeMiddlewareFactory) userAuthorizeMiddlewareFactory: IUserAuthorizeMiddlewareFactory,
    ) {
        this.postService = postService;

        this.router.post(
            routesMap["post-get-create-update-remove"],
            joiValidateMiddlewareFactory({body: postCreateRequestSchema}),
            userAuthorizeMiddlewareFactory([{role: ['admin']}]),
            this.createPost,
        );
        this.router.put(
            routesMap["post-get-create-update-remove"],
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
            routesMap["post-get-create-update-remove"],
            joiValidateMiddlewareFactory({query: postGetByObjectidRequestSchema}),
            userAuthorizeMiddlewareFactory([{role: ['admin']}]),
            this.getPost,
        );
        this.router.get(
            routesMap.import,
            joiValidateMiddlewareFactory({query: postGetManyRequestSchema}),
            userAuthorizeMiddlewareFactory([{role: ['admin']}]),
            this.importPosts,
        );
        this.router.get(
            routesMap.find,
            joiValidateMiddlewareFactory({query: postFindCriteriaSchema}),
            userAuthorizeMiddlewareFactory([{role: ['admin']}]),
            this.findPosts,
        );
        this.router.get(
            routesMap["public-get"],
            joiValidateMiddlewareFactory({query: postGetRequestSchema}),
            // auth check will be in service, depends on entity
            this.getPostForPublic
        );
        this.router.put(
            routesMap["update-status"],
            joiValidateMiddlewareFactory({body: postUpdateStatusRequestSchema}),
            userAuthorizeMiddlewareFactory([{role: ['admin']}]), // additional check must be in service, depends on entity
            this.updateStatus,
        );
        this.router.get(
            routesMap["public-find"],
            joiValidateMiddlewareFactory({query: postPublicFindCriteriaSchema}),
            // auth check will be in service, depends on entity
            this.findPostsForPublic,
        );
        this.router.delete(
            routesMap["post-get-create-update-remove"],
            joiValidateMiddlewareFactory({body: postGetManyRequestSchema}),
            userAuthorizeMiddlewareFactory([{role: ['admin']}]), // additional check will be in service, depends on entity
            this.remove,
        );
        this.router.get(
            routesMap.tags,
            joiValidateMiddlewareFactory({query: tagListRequestSchema}),
            // any user
            this.getTags
        );
        this.router.get(
            routesMap.sitemap,
            this.getSitemap,
        )
    }

    getAllowedMethodsMiddleware(options?: Router.IRouterAllowedMethodsOptions): Middleware {
        return this.router.allowedMethods(options);
    }

    getRouteMiddleware(): Middleware {
        return this.router.routes();
    }

}
