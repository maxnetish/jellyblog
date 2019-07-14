import Router = require('koa-router');
import {ICredentials} from "../auth/credentials";
import {findUserInfoByCredentials, findUserInfoByUsername} from "../auth/user-service";
import jsonwebtoken from 'jsonwebtoken';
import {getRefreshTokenCookieKey, getRefreshTokenExpiresInDays, getSecret, getTokenSignOptions} from "./token-options";
import {Context} from "koa";
import {ITokenResponse} from './token-response';
import {createAndRegisterRefreshToken, findByToken as tokenInfoFindByToken} from "./token-service";
import {routesMap} from "./token-routes-map";
import {writeFailResultTo} from "../utils/write-fail-result-to";
import {writeWWWauthenticateHeaderTo} from "../utils/write-www-authenticate-header-to";

const router = new Router({
    prefix: routesMap.prefix,
});

function writeBadRefreshTokenResponse(context: Context): Context {
    writeWWWauthenticateHeaderTo(context);
    return writeFailResultTo(context, 401, 'Invalid refresh token');
}

router.post(routesMap['token-refresh'], async (context: Context) => {
    const refreshToken = context.cookies.get(getRefreshTokenCookieKey());

    if (!refreshToken) {
        // no refresh token
        writeBadRefreshTokenResponse(context);
        return;
    }

    const tokenInfo = await tokenInfoFindByToken(refreshToken);
    if (!tokenInfo) {
        // token not found
        writeBadRefreshTokenResponse(context);
        return;
    }
    if (tokenInfo.validBefore < new Date()) {
        // refresh token expired
        writeBadRefreshTokenResponse(context);
        return;
    }

    // refresh token valid
    const foundUserInfo = await findUserInfoByUsername(tokenInfo.username, {user: context.state.user});
    if (!foundUserInfo) {
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

    if (!(credentials.password && credentials.username)) {
        // bad request
        writeFailResultTo(context, 400);
        return;
    }

    const foundUserInfo = await findUserInfoByCredentials(credentials);

    if (!foundUserInfo) {
        // auth failed
        writeFailResultTo(context, 401);
        writeWWWauthenticateHeaderTo(context);
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
