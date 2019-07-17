/**
 * See https://github.com/ljharb/qs
 */

import qs, {IParseOptions} from 'qs';
import {Middleware} from "koa";
import {IQueryParseMiddlewareFactory} from "../api/query-parse-middleware";

/**
 * Add ctx.state.query
 * @param {IParseOptions} queryParseOptions
 */
export const queryParseMiddlewareFactory: IQueryParseMiddlewareFactory =
    function queryParseMiddlewareFactory(queryParseOptions: IParseOptions): Middleware {
        return async function queryParsemiddleware(ctx, next) {
            ctx.state.query = qs.parse(ctx.querystring, queryParseOptions);
            await next();
        };
    };
