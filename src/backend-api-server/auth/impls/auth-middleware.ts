import {Context, Middleware} from "koa";
import {verify} from "jsonwebtoken";
import {USER_ROLES} from "../dto/user-roles";
import {container} from "../../ioc/container";
import {TYPES} from "../../ioc/types";
import {ITokenOptions} from "../../token/api/token-options";
import {IUserContextFactory} from "../api/user-context";

/**
 * See https://tools.ietf.org/html/rfc6750
 * @param ctx
 */

const oneOrMoreSpace = /\s+/;
const formParameterNameOfToken = 'access_token';

function extractJwtFromHeader(ctx: Context): string | null {
    // Use scheme Bearer
    // See https://tools.ietf.org/html/rfc2617
    const authorizationHeader = ctx.get('Authorization');

    if (!authorizationHeader) {
        return null;
    }

    const authorizationHeaderSplitted = authorizationHeader.split(oneOrMoreSpace);

    if (!(authorizationHeaderSplitted.length > 1 && authorizationHeaderSplitted[0] == 'Bearer' && authorizationHeaderSplitted[1])) {
        return null;
    }

    return authorizationHeaderSplitted[1];
}

function extractJwtFromBody(ctx: Context): string | null {
    // Use ctx.request.body, field 'access_token'
    if (!(ctx.request.body && ctx.request.body[formParameterNameOfToken])) {
        return null;
    }

    if (ctx.get('Content-Type') !== 'application/x-www-form-urlencoded') {
        return null;
    }

    return ctx.request.body[formParameterNameOfToken];
}

function extractJwtFromUrlQuery(ctx: Context): string | null {
    // lookup query on ctx.state.query
    if (!(ctx.state.query && ctx.state.query[formParameterNameOfToken])) {
        return null;
    }

    return ctx.state.query[formParameterNameOfToken];
}

function extractJwt(ctx: Context): string | null {
    const extracted = [
        extractJwtFromHeader(ctx),
        extractJwtFromBody(ctx),
        extractJwtFromUrlQuery(ctx),
    ].filter(t => !!t);

    if (extracted.length > 1) {
        // Clients MUST NOT use more
        // than one method to transmit the token
        throw {
            // Bad request
            status: 400
        };
    }

    if (extracted.length === 0) {
        return null;
    }

    return extracted[0];
}

/**
 * Add ctx.state.user: UserContext (if jwt payload valid)
 * @param ctx
 * @param next
 */
export const authJwtMiddleware: Middleware = async function authJwtMiddleware(ctx, next) {
    const jwt = extractJwt(ctx);
    debugger;
    const userContextFactory: IUserContextFactory = container.get(TYPES.UserContextFactory);
    const tokenOptions = container.get<ITokenOptions>(TYPES.JwtTokenOptions);

    if (!jwt) {
        // add anonymous context
        ctx.state.user = userContextFactory();
        await next();
        return;
    }

    const signOptions = tokenOptions.getTokenSignOptions();

    const promiseVerify = new Promise<object | string>((resolve, reject) => {
        verify(jwt, tokenOptions.getSecret(), {
            algorithms: [signOptions.algorithm || 'HS256'],
            audience: signOptions.audience,
            issuer: signOptions.issuer,
        }, (err, payload) => {
            if (err) {
                // reject with status 400 - Bad request
                // because bearer token bad/
                // And next client must do something with this;
                reject({
                    message: err.message,
                    status: 400,
                });
                return;
            }
            resolve(payload);
        });
    });

    const verifiedPayload = await promiseVerify as { [key: string]: string };

    if (verifiedPayload && verifiedPayload.username && verifiedPayload.role) {
        ctx.state.user = userContextFactory({
            username: verifiedPayload.username,
            role: verifiedPayload.role as USER_ROLES,
        });
    } else {
        ctx.state.user = userContextFactory();
    }

    await next();
};
