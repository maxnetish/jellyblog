import Router = require('koa-router');
import {ICredentials} from "../../auth/dto/credentials";
import jsonwebtoken from 'jsonwebtoken';
import {Context} from "koa";
import {ITokenResponse} from '../dto/token-response';
import {routesMap} from "./token-routes-map";
import {container} from "../../ioc/container";
import {TYPES} from "../../ioc/types";
import {ITokenOptions} from "../api/token-options";
import {ITokenService} from "../api/token-service";
import {joiValidateMiddlewareFactory} from "../../utils/impls/joi-validate-middleware";
import {credentialsSchema} from "../../auth/dto/credentials.schema";
import {IUserService} from "../../auth/api/user-service";

const router = new Router({
    prefix: routesMap.prefix,
});

const tokenOptions = container.get<ITokenOptions>(TYPES.JwtTokenOptions);
const tokenService = container.get<ITokenService>(TYPES.JwtTokenService);
const userService = container.get<IUserService>(TYPES.UserService);

function throw401Status(context: Context): Context {
    throw {
        statusCode: 401,
        message: 'Invalid refresh token'
    };
}

router.post(routesMap['token-refresh'], async (context: Context) => {
    const refreshToken = context.cookies.get(tokenOptions.getRefreshTokenCookieKey());

    if (!refreshToken) {
        // no refresh token
        throw401Status(context);
        return;
    }

    const tokenInfo = await tokenService.findByToken(refreshToken);
    if (!tokenInfo) {
        // token not found
        throw401Status(context);
        return;
    }
    if (tokenInfo.validBefore < new Date()) {
        // refresh token expired
        throw401Status(context);
        return;
    }

    // refresh token valid
    const foundUserInfo = await userService.findUserInfoByUsername(tokenInfo.username, {user: context.state.user});
    if (!foundUserInfo) {
        // user not found - invalid
        throw401Status(context);
        return;
    }

    const jwt = jsonwebtoken.sign(foundUserInfo, tokenOptions.getSecret(), tokenOptions.getTokenSignOptions());
    // send new JWT
    context.body = {
        message: 'OK',
        token: jwt,
    } as ITokenResponse;
});

router.post(routesMap['token-get'],
    joiValidateMiddlewareFactory({body: credentialsSchema}),
    async (context: Context) => {
        const credentials: ICredentials = context.request.body;

        // if (!(credentials.password && credentials.username)) {
        //     // bad request
        //     writeFailResultTo(context, 400);
        //     return;
        // }

        const foundUserInfo = await userService.findUserInfoByCredentials(credentials);

        if (!foundUserInfo) {
            // auth failed
            throw {
                statusCode: 401,
                message: 'Password or username invalid'
            };
        }

        // auth success, create token
        const jwt = jsonwebtoken.sign(foundUserInfo, tokenOptions.getSecret(), tokenOptions.getTokenSignOptions());

        const refreshToken = await tokenService.createAndRegisterRefreshToken(foundUserInfo.username);

        context.cookies.set(tokenOptions.getRefreshTokenCookieKey(), refreshToken, {
            maxAge: tokenOptions.getRefreshTokenExpiresInDays() * 24 * 60 * 60 * 1000,
            httpOnly: true,
            secure: context.app.env != 'development' && context.app.env != 'test',
        });

        context.body = {
            message: 'OK',
            token: jwt,
        } as ITokenResponse;
    });


export {
    router,
};
