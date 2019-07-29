import {Container} from "inversify";
import {TYPES} from "./types";
import {TokenOptions} from "../token/impls/token-options";
import {ITokenOptions} from "../token/api/token-options";
import {ITokenService} from "../token/api/token-service";
import {TokenService} from "../token/impls/token-service";
import {ILogService} from "../log/api/log-service";
import {LogService} from "../log/impls/log-service";
import {IUserContextFactory} from "../auth/api/user-context";
import {userContextFactory} from "../auth/impls/user-context";
import {IUserService} from "../auth/api/user-service";
import {UserService} from "../auth/impls/user-service";
import {IJoiValidationMiddlewareFactory} from "../utils/api/joi-validation-middleware";
import {joiValidateMiddlewareFactory} from "../utils/impls/joi-validate-middleware";
import {IQueryParseMiddlewareFactory} from "../utils/api/query-parse-middleware";
import {queryParseMiddlewareFactory} from "../utils/impls/query-parse-middleware";
import {IRouteController} from "../utils/api/route-controller";
import {TokenController} from "../token/koa-routes/token-routes";
import {EchoController} from "../echo/echo";
import {UserController} from "../auth/koa-routes/user-routes";
import {IAuthenticatedUserFromJwtResolver} from "../auth/api/authenticated-user-from-jwt-resolver";
import {AuthenticatedUserFromJwtResolver} from "../auth/impls/authenticated-user-from-jwt-resolver";
import {IAppBuilder} from "../app-builder";
import {AppBuilder} from "../koa-app";
import {Model} from "mongoose";
import {IUserDocument} from "../auth/api/user-document";
import {UserModel} from "../auth/impls/user-model";
import {IUserRefreshTokenDocument} from "../token/api/user-refresh-token-document";
import {UserRefreshTokenModel} from "../token/impls/user-refresh-token-model";
import {ILogEntryDocument} from "../log/dto/log-entry-document";
import {LogModel} from "../log/impls/log-model";
import {IUserAuthorizeMiddlewareFactory} from "../auth/api/user-authorize-middleware-factory";
import {userAuthorizeMiddlewareFactory} from "../auth/impls/user-authorize-middleware";
import {IFileService} from "../filestore/api/file-service";
import {FileService} from "../filestore/impls/file-service";
import {IPaginationUtils} from "../utils/api/pagination-utils";
import {PaginationUtils} from "../utils/impls/pagination-utils";
import {IFileMulterGridFsDocument} from "../filestore/dto/file-multer-gridfs-document";
import {FileModel} from "../filestore/impls/file-model";
import {FileDataModel} from "../filestore/impls/file-data-model";
import {FileStoreController} from "../filestore/koa-routes/filestore-routes";
import {IOptionsDocument} from "../options/dto/options-document";
import {OptionsModel} from "../options/impls/options-model";
import {IOptionsService} from "../options/api/options-service";
import {OptionsService} from "../options/impls/options-service";
import {OptionsController} from "../options/koa-routes/options-routes";
import {LogController} from "../log/koa-routes/log-routes";
import {IPostAllDetailsPopulatedDocument} from "../post/dto/post-all-details-populated-document";
import {PostModel} from "../post/impls/post-model";
import {PostController} from "../post/koa-routes/post-routes";
import {IMarkdownConverter} from "../utils/api/markdown-converter";
import {ShowdownConverter} from "../utils/impls/showdown-converter";
import {IPostService} from "../post/api/post-service";
import {PostService} from "../post/impls/post-service";

export const container = new Container({
    defaultScope: 'Singleton'
});

// application
container.bind<IAppBuilder>(TYPES.AppBuilder).to(AppBuilder);

// services and utils
container.bind<ITokenOptions>(TYPES.JwtTokenOptions).toConstantValue(new TokenOptions());
container.bind<ITokenService>(TYPES.JwtTokenService).to(TokenService);
container.bind<ILogService>(TYPES.LogService).to(LogService);
container.bind<IUserService>(TYPES.UserService).to(UserService);
container.bind<IFileService>(TYPES.FileService).to(FileService);
container.bind<IPaginationUtils>(TYPES.PaginationUtils).to(PaginationUtils);
container.bind<IOptionsService>(TYPES.OptionsService).to(OptionsService);
container.bind<IMarkdownConverter>(TYPES.MarkdownConverter).to(ShowdownConverter);
container.bind<IPostService>(TYPES.PostService).to(PostService);

// objects with behavior
container.bind<IUserContextFactory>(TYPES.UserContextFactory).toFunction(userContextFactory);

// models
container.bind<Model<IUserDocument>>(TYPES.ModelUser).toConstantValue(UserModel);
container.bind<Model<IUserRefreshTokenDocument>>(TYPES.ModelRefreshToken).toConstantValue(UserRefreshTokenModel);
container.bind<Model<ILogEntryDocument>>(TYPES.ModelLog).toConstantValue(LogModel);
container.bind<Model<IFileMulterGridFsDocument>>(TYPES.ModelFile).toConstantValue(FileModel);
container.bind<Model<any>>(TYPES.ModelFileData).toConstantValue(FileDataModel);
container.bind<Model<IOptionsDocument>>(TYPES.ModelOptions).toConstantValue(OptionsModel);
container.bind<Model<IPostAllDetailsPopulatedDocument>>(TYPES.ModelPost).toConstantValue(PostModel);

// middleware
container.bind<IAuthenticatedUserFromJwtResolver>(TYPES.AuthMiddleware).to(AuthenticatedUserFromJwtResolver);
container.bind<IJoiValidationMiddlewareFactory>(TYPES.JoiValidationMiddlewareFactory).toFunction(joiValidateMiddlewareFactory);
container.bind<IQueryParseMiddlewareFactory>(TYPES.QueryParseMiddlewareFactory).toFunction(queryParseMiddlewareFactory);
container.bind<IUserAuthorizeMiddlewareFactory>(TYPES.UserAuthorizeMiddlewareFactory).toFunction(userAuthorizeMiddlewareFactory);

// route controller
container.bind<IRouteController>(TYPES.RouteTokenController).to(TokenController);
container.bind<IRouteController>(TYPES.RouteEchoController).to(EchoController);
container.bind<IRouteController>(TYPES.RouteUserController).to(UserController);
container.bind<IRouteController>(TYPES.FilestoreController).to(FileStoreController);
container.bind<IRouteController>(TYPES.OptionsController).to(OptionsController);
container.bind<IRouteController>(TYPES.LogController).to(LogController);
container.bind<IRouteController>(TYPES.PostController).to(PostController);
container.bind<IRouteController[]>(TYPES.RouteControllers).toDynamicValue(context => {
    return [
        context.container.get<IRouteController>(TYPES.RouteUserController),
        context.container.get<IRouteController>(TYPES.RouteTokenController),
        context.container.get<IRouteController>(TYPES.RouteEchoController),
        context.container.get<IRouteController>(TYPES.FilestoreController),
        context.container.get<IRouteController>(TYPES.OptionsController),
        context.container.get<IRouteController>(TYPES.LogController),
        context.container.get<IRouteController>(TYPES.PostController),
    ];
});
