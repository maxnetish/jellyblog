import {IParseOptions} from "qs";
import {Middleware} from "koa";

export interface IQueryParseMiddlewareFactory {
    /**
     * Add ctx.state.query
     * @param {IParseOptions} queryParseOptions
     */
    (queryParseOptions: IParseOptions): Middleware
}
