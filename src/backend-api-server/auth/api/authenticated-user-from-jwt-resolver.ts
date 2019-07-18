import {Context, Middleware} from "koa";
import {IUserContext} from "./user-context";

export interface IAuthenticatedUserFromJwtResolver {
    middleware: Middleware;
    userContextFromKoaContext: (ctx: Context) => Promise<IUserContext>;
}
