import Router = require('koa-router');
import {ICredentials} from "../../auth/dto/credentials";
import jsonwebtoken from 'jsonwebtoken';
import {Context, Middleware} from "koa";
import {ITokenResponse} from '../dto/token-response';
import {routesMap} from "./token-routes-map";
import {TYPES} from "../../ioc/types";
import {ITokenOptions} from "../api/token-options";
import {ITokenService} from "../api/token-service";
import {credentialsSchema} from "../../auth/dto/credentials.schema";
import {IUserService} from "../../auth/api/user-service";
import {IRouteController} from "../../utils/api/route-controller";
import {IMiddleware} from "koa-router";
import {inject, injectable} from "inversify";
import {IJoiValidationMiddlewareFactory} from "../../utils/api/joi-validation-middleware";

@injectable()
export class TokenController implements IRouteController {

    private readonly router = new Router({
        prefix: routesMap.prefix,
    });

    private readonly tokenOptions: ITokenOptions;
    private readonly tokenService: ITokenService;
    private readonly userService: IUserService;

    private throw401Status(message: string = 'Invalid refresh token'): Context {
        throw {
            statusCode: 401,
            message
        };
    }

    private tokenRefresh: Middleware = async ctx => {
        const refreshToken = ctx.cookies.get(this.tokenOptions.getRefreshTokenCookieKey());

        if (!refreshToken) {
            // no refresh token
            this.throw401Status();
            return;
        }

        const tokenInfo = await this.tokenService.findByToken(refreshToken);
        if (!tokenInfo) {
            // token not found
            this.throw401Status();
            return;
        }
        if (tokenInfo.validBefore < new Date()) {
            // refresh token expired
            this.throw401Status();
            return;
        }

        // refresh token valid
        const foundUserInfo = await this.userService.findUserInfoByUsername(tokenInfo.username, {user: ctx.state.user});
        if (!foundUserInfo) {
            // user not found - invalid
            this.throw401Status();
            return;
        }

        const jwt = jsonwebtoken.sign(foundUserInfo, this.tokenOptions.getSecret(), this.tokenOptions.getTokenSignOptions());
        // send new JWT
        ctx.body = {
            message: 'OK',
            token: jwt,
        } as ITokenResponse;
    };

    private tokenGet: Middleware = async ctx => {
        const credentials: ICredentials = ctx.request.body;
        const foundUserInfo = await this.userService.findUserInfoByCredentials(credentials);

        if (!foundUserInfo) {
            // auth failed
            this.throw401Status('Password or username invalid');
            return;
        }

        // auth success, create token
        const jwt = jsonwebtoken.sign(foundUserInfo, this.tokenOptions.getSecret(), this.tokenOptions.getTokenSignOptions());

        const refreshToken = await this.tokenService.createAndRegisterRefreshToken(foundUserInfo.username);

        ctx.cookies.set(this.tokenOptions.getRefreshTokenCookieKey(), refreshToken, {
            maxAge: this.tokenOptions.getRefreshTokenExpiresInDays() * 24 * 60 * 60 * 1000,
            httpOnly: true,
            secure: ctx.app.env != 'development' && ctx.app.env != 'test',
        });

        ctx.body = {
            message: 'OK',
            token: jwt,
        } as ITokenResponse;
    };

    constructor(
        @inject(TYPES.JoiValidationMiddlewareFactory) joiValidationMiddlewareFactory: IJoiValidationMiddlewareFactory,
        @inject(TYPES.JwtTokenOptions) tokenOptions: ITokenOptions,
        @inject(TYPES.JwtTokenService) tokenService: ITokenService,
        @inject(TYPES.UserService) userService: IUserService,
    ) {
        this.tokenOptions = tokenOptions;
        this.tokenService = tokenService;
        this.userService = userService;

        this.router.post(
            routesMap['token-refresh'],
            this.tokenRefresh
        );
        this.router.post(
            routesMap['token-get'],
            joiValidationMiddlewareFactory({body: credentialsSchema}),
            this.tokenGet
        );
    }

    getRouteMiddleware(): IMiddleware {
        return this.router.routes();
    }

    getAllowedMethodsMiddleware(options?: Router.IRouterAllowedMethodsOptions | undefined): IMiddleware {
        return this.router.allowedMethods(options);
    }
}
