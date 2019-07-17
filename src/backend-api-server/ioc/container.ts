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
import {Middleware} from "koa";
import {authJwtMiddleware} from "../auth/impls/auth-middleware";
import {IJoiValidationMiddlewareFactory} from "../utils/api/joi-validation-middleware";
import {joiValidateMiddlewareFactory} from "../utils/impls/joi-validate-middleware";
import {IQueryParseMiddlewareFactory} from "../utils/api/query-parse-middleware";
import {queryParseMiddlewareFactory} from "../utils/impls/query-parse-middleware";
import {IRouteController} from "../utils/api/route-controller";
import {TokenController} from "../token/koa-routes/token-routes";
import {EchoController} from "../echo/echo";
import {UserController} from "../auth/koa-routes/user-routes";

export const container = new Container({
    defaultScope: 'Singleton'
});

// debugger;
// services
container.bind<ITokenOptions>(TYPES.JwtTokenOptions).toConstantValue(new TokenOptions());
container.bind<ITokenService>(TYPES.JwtTokenService).to(TokenService);
container.bind<ILogService>(TYPES.LogService).toConstantValue(new LogService());
container.bind<IUserService>(TYPES.UserService).to(UserService);

// objects with behavior
container.bind<IUserContextFactory>(TYPES.UserContextFactory).toFunction(userContextFactory);

// middleware
container.bind<Middleware>(TYPES.AuthMiddleware).toFunction(authJwtMiddleware);
container.bind<IJoiValidationMiddlewareFactory>(TYPES.JoiValidationMiddlewareFactory).toFunction(joiValidateMiddlewareFactory);
container.bind<IQueryParseMiddlewareFactory>(TYPES.QueryParseMiddlewareFactory).toFunction(queryParseMiddlewareFactory);

// route controller
container.bind<IRouteController>(TYPES.RouteTokenController).to(TokenController);
container.bind<IRouteController>(TYPES.RouteEchoController).to(EchoController);
container.bind<IRouteController>(TYPES.RouteUserController).to(UserController);
