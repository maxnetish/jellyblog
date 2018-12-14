/**
 * See https://github.com/ljharb/qs
 */

import qs from 'qs';

export default function queryParseMiddlewareFactory (queryParseOptions){
    return async function queryParsemiddleware(ctx, next) {
        ctx.state.query = qs.parse(ctx.querystring, queryParseOptions);
        await next();
    }
};