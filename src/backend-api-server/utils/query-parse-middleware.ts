/**
 * See https://github.com/ljharb/qs
 */

import qs, {IParseOptions} from 'qs';
import {Middleware} from "koa";

/**
 * Add ctx.state.query
 * @param {IParseOptions} queryParseOptions
 */
export function queryParseMiddlewareFactory(queryParseOptions: IParseOptions): Middleware {
    return async function queryParsemiddleware(ctx, next) {
        ctx.state.query = qs.parse(ctx.querystring, queryParseOptions);
        await next();
    };
}
