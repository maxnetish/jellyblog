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
import {ILogEntryDocument} from "../log/api/log-entry-document";
import {LogModel} from "../log/impls/log-model";

export const container = new Container({
    defaultScope: 'Singleton'
});

// application
container.bind<IAppBuilder>(TYPES.AppBuilder).to(AppBuilder);

// debugger;
// services
container.bind<ITokenOptions>(TYPES.JwtTokenOptions).toConstantValue(new TokenOptions());
container.bind<ITokenService>(TYPES.JwtTokenService).to(TokenService);
container.bind<ILogService>(TYPES.LogService).to(LogService);
container.bind<IUserService>(TYPES.UserService).to(UserService);

// objects with behavior
container.bind<IUserContextFactory>(TYPES.UserContextFactory).toFunction(userContextFactory);

// models
container.bind<Model<IUserDocument>>(TYPES.ModelUser).toConstantValue(UserModel);
container.bind<Model<IUserRefreshTokenDocument>>(TYPES.ModelRefreshToken).toConstantValue(UserRefreshTokenModel);
container.bind<Model<ILogEntryDocument>>(TYPES.ModelLog).toConstantValue(LogModel);

// middleware
container.bind<IAuthenticatedUserFromJwtResolver>(TYPES.AuthMiddleware).to(AuthenticatedUserFromJwtResolver);
container.bind<IJoiValidationMiddlewareFactory>(TYPES.JoiValidationMiddlewareFactory).toFunction(joiValidateMiddlewareFactory);
container.bind<IQueryParseMiddlewareFactory>(TYPES.QueryParseMiddlewareFactory).toFunction(queryParseMiddlewareFactory);

// route controller
container.bind<IRouteController>(TYPES.RouteTokenController).to(TokenController);
container.bind<IRouteController>(TYPES.RouteEchoController).to(EchoController);
container.bind<IRouteController>(TYPES.RouteUserController).to(UserController);
container.bind<IRouteController[]>(TYPES.RouteControllers).toDynamicValue(context => {
    return [
        context.container.get<IRouteController>(TYPES.RouteUserController),
        context.container.get<IRouteController>(TYPES.RouteTokenController),
        context.container.get<IRouteController>(TYPES.RouteEchoController),
    ];
});
