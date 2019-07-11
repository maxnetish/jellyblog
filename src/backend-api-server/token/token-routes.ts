import Router = require('koa-router');
import {ICredentials} from "../auth/credentials";
import {findUserInfoByCredentials, findUserInfoByUsername} from "../auth/user-service";
import jsonwebtoken from 'jsonwebtoken';
import {getRefreshTokenCookieKey, getRefreshTokenExpiresInDays, getSecret, getTokenSignOptions} from "./token-options";
import {Context} from "koa";
import {ITokenResponse} from './token-response';
import {createAndRegisterRefreshToken, findByToken as tokenInfoFindByToken} from "./token-service";
import {routesMap} from "./token-routes-map";

const router = new Router({
    prefix: routesMap.prefix,
});

function writeBadRefreshTokenResponse(context: Context) {
    context.status = 401;
    context.state.errMessage = 'Invalid refresh token';
    context.body = {
        message: context.state.errMessage,
        token: null,
    } as ITokenResponse;
}

router.post(routesMap['token-refresh'] as string, async (context: Context) => {
    const refreshToken = context.cookies.get(getRefreshTokenCookieKey());

    if(!refreshToken) {
        // no refresh token
        writeBadRefreshTokenResponse(context);
        return;
    }

    const tokenInfo = await tokenInfoFindByToken(refreshToken);
    if(!tokenInfo) {
        // token not found
        writeBadRefreshTokenResponse(context);
        return;
    }
    if(tokenInfo.validBefore < new Date()) {
        // refresh token expired
        writeBadRefreshTokenResponse(context);
        return;
    }

    // refresh token valid
    const foundUserInfo = await findUserInfoByUsername(tokenInfo.username);
    if(!foundUserInfo) {
        // user not found - invalid
        writeBadRefreshTokenResponse(context);
        return;
    }

    const jwt = jsonwebtoken.sign(foundUserInfo, getSecret(), getTokenSignOptions());
    // send new JWT
    context.body = {
        message: 'OK',
        token: jwt,
    } as ITokenResponse;
});

router.post(routesMap['token-get'], async (context: Context) => {

    const credentials: ICredentials = context.request.body;

    if(!(credentials.password && credentials.username)) {
        // bad request
        context.status = 400;
        context.state.errMessage = 'Bad request';
        context.body = {
            message: context.state.errMessage,
            token: null,
        } as ITokenResponse;
        return;
    }

    const foundUserInfo = await findUserInfoByCredentials(credentials);

    if (!foundUserInfo) {
        // auth failed
        context.status = 401;
        context.state.errMessage = 'Authentication failed';
        context.body = {
            message: context.state.errMessage,
            token: null,
        } as ITokenResponse;
        return;
    }

    // auth success, create token
    const jwt = jsonwebtoken.sign(foundUserInfo, getSecret(), getTokenSignOptions());

    const refreshToken = await createAndRegisterRefreshToken(foundUserInfo.username);

    context.cookies.set(getRefreshTokenCookieKey(), refreshToken, {
        maxAge: getRefreshTokenExpiresInDays() * 24 * 60 * 60 * 1000,
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
