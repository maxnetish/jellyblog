import {Context} from "koa";

/**
 * Add WWW-Authenticate header - MUST when  request does not include authentication
 credentials or does not contain an access token that enables access
 to the protected resource
 * See https://tools.ietf.org/html/rfc6750
 * @param {Context} context
 */
export function writeWWWauthenticateHeaderTo(context: Context): Context {
    context.set('WWW-Authenticate', 'Bearer realm="Protected area"');
    return context;
}
