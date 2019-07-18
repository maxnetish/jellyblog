import {Context, Middleware} from "koa";
import {verify} from "jsonwebtoken";
import {USER_ROLES} from "../dto/user-roles";
import {TYPES} from "../../ioc/types";
import {ITokenOptions} from "../../token/api/token-options";
import {IUserContextFactory} from "../api/user-context";
import {IAuthenticatedUserFromJwtResolver} from "../api/authenticated-user-from-jwt-resolver";
import {inject, injectable} from "inversify";

/**
 * See https://tools.ietf.org/html/rfc6750
 * @param ctx
 */
@injectable()
export class AuthenticatedUserFromJwtResolver implements IAuthenticatedUserFromJwtResolver {
    private readonly oneOrMoreSpace = /\s+/;
    private readonly formParameterNameOfToken = 'access_token';
    private readonly userContextFactory: IUserContextFactory;
    private readonly tokenOptions: ITokenOptions;

    private extractJwtFromHeader(ctx: Context): string | null {
        // Use scheme Bearer
        // See https://tools.ietf.org/html/rfc2617
        const authorizationHeader = ctx.get('Authorization');

        if (!authorizationHeader) {
            return null;
        }

        const authorizationHeaderSplitted = authorizationHeader.split(this.oneOrMoreSpace);

        if (!(authorizationHeaderSplitted.length > 1 && authorizationHeaderSplitted[0] == 'Bearer' && authorizationHeaderSplitted[1])) {
            return null;
        }

        return authorizationHeaderSplitted[1];
    }

    private extractJwtFromBody(ctx: Context): string | null {
        // Use ctx.request.body, field 'access_token'
        if (!(ctx.request.body && ctx.request.body[this.formParameterNameOfToken])) {
            return null;
        }

        if (ctx.get('Content-Type') !== 'application/x-www-form-urlencoded') {
            return null;
        }

        return ctx.request.body[this.formParameterNameOfToken];
    }

    private extractJwtFromUrlQuery(ctx: Context): string | null {
        // lookup query on ctx.state.query
        if (!(ctx.state.query && ctx.state.query[this.formParameterNameOfToken])) {
            return null;
        }

        return ctx.state.query[this.formParameterNameOfToken];
    }

    private extractJwt(ctx: Context): string | null {
        const extracted = [
            this.extractJwtFromHeader(ctx),
            this.extractJwtFromBody(ctx),
            this.extractJwtFromUrlQuery(ctx),
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

    constructor(
        @inject(TYPES.UserContextFactory) userContextFactory: IUserContextFactory,
        @inject(TYPES.JwtTokenOptions) tokenOptions: ITokenOptions,
    ) {
        this.userContextFactory = userContextFactory;
        this.tokenOptions = tokenOptions;
    }

    /**
     * Add ctx.state.user: UserContext (if jwt payload valid)
     * @param ctx
     * @param next
     */
    middleware: Middleware = async (ctx, next) => {
        const userContext = await this.userContextFromKoaContext(ctx);
        // add to context
        ctx.state.user = userContext;
        await next();
    };

    userContextFromKoaContext = async (ctx: Context) => {
        const jwt = this.extractJwt(ctx);

        if (!jwt) {
            // create anonymous context
            return this.userContextFactory();
        }

        const signOptions = this.tokenOptions.getTokenSignOptions();

        const promiseVerify = new Promise<object | string>((resolve, reject) => {
            verify(jwt, this.tokenOptions.getSecret(), {
                algorithms: [signOptions.algorithm || 'HS256'],
                audience: signOptions.audience,
                issuer: signOptions.issuer,
            }, (err, payload) => {
                if (err) {
                    // reject with status 400 - Bad request
                    // because bearer token bad/
                    // And now client must do something with this;
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
            return this.userContextFactory({
                username: verifiedPayload.username,
                role: verifiedPayload.role as USER_ROLES,
            });
        }
        return this.userContextFactory();
    };
}
