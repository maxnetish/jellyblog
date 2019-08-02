import {IGridfsServeMiddlewareFactory, IGridfsServeMiddlewareOptions} from "../api/gridfs-serve-middleware";
import {ConnectionBase} from "mongoose";
import {GridFSBucket, GridFSBucketOptions} from "mongodb";
import {Context, Middleware} from "koa";
import parseRange = require('range-parser');
import {Range, Ranges, Result} from 'range-parser';

export class GridfsServeMiddleware implements IGridfsServeMiddlewareFactory {



    private makeHeaders(doc, options) {
        const headers = {}; // keys have to be in lowercase for the fresh function to work
        const {
            cacheControl,
            maxAge = 0,
            etag,
            lastModified,
            acceptRanges,
        } = options;

        if (cacheControl !== false) headers['cache-control'] = cacheControl || 'public, max-age=' + maxAge;
        if (etag !== false) headers['etag'] = doc.md5;
        if (lastModified !== false) headers['last-modified'] = new Date(doc.uploadDate.toString()); // has to use toString() to get rid of the milliseconds which can cause freshness problem
        if (acceptRanges !== false) headers['accept-ranges'] = 'bytes';
        if (doc.contentType) {
            headers['content-type'] = doc.contentType;
            headers['X-Content-Type-Options'] = 'nosniff';
        }

        return headers;
    }

    private makeRanges(ctx: Context, responseHeaders: { [key: string]: string }, len: number, options: IGridfsServeMiddlewareOptions): { ranges: Ranges | Result, start: number, end: number } {
        let ranges = ctx.headers.range;
        let start = 0;
        let end = len;
        let parsedRanges: Ranges | Result;

        if (!(options.acceptRanges !== false && /^ *bytes=/.test(ranges))) {
            return {
                ranges,
                start,
                end
            };
        }

        if (!this.isRangeFresh(ctx.headers.range, responseHeaders)) {
            parsedRanges = -2;
        } else {
            parsedRanges = parseRange(len, ranges, {combine: true});
        }

        if (parsedRanges === -1) {
            // -1 means unsatisfiable range
            ctx.set('Content-Range', this.contentRange('bytes', end));
            // 416 Requested Range Not Satisfiable
            ctx.status = 416;
        }

        // valid (syntactically invalid/multiple ranges are treated as a regular response)
        if (parsedRanges !== -2 && parsedRanges !== -1 && parsedRanges.length === 1) {
            // Content-Range
            ctx.status = 206;
            ctx.set('content-range', this.contentRange('bytes', end, parsedRanges[0]));
            // adjust for requested range
            start += parsedRanges[0].start;
            end = parsedRanges[0].end + 1;
        }

        return {
            ranges: parsedRanges,
            start,
            end,
        };
    }


    private isConditionalGET(reqHeaders: { [key: string]: string }) {
        return reqHeaders['if-none-match'] || reqHeaders['if-modified-since'];
    }

    // TODO Когда нибудь разобраться с этим костылём ()
    // https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/If-Range
    private isRangeFresh(reqHeader: any, resHeader: any): number | boolean {
        const ifRange = reqHeader['if-range'];
        if (!ifRange) return true;
        return ~ifRange.indexOf('"')
            ? ~ifRange.indexOf(resHeader['etag'])
            : Date.parse(resHeader['last-modified']) <= Date.parse(ifRange);
    }

    private contentRange(type: string, size: number, range?: Range): string {
        return type + ' ' + (range ? range.start + '-' + range.end : '*') + '/' + size;
    }

    middleware(connection: ConnectionBase, options: IGridfsServeMiddlewareOptions): Middleware {
        const {bucketName = 'fs'} = options;
        return async function serveGridfsKoaMiddleware(ctx, next) {
            if (ctx.method !== 'GET' && ctx.method !== 'HEAD') {
                if (options.fallthrough !== false) {
                    await next();
                    return;
                }

                // method not allowed
                ctx.set({
                    'Allow': 'GET, HEAD',
                    'Content-Length': '0'
                });
                ctx.status = 405;
                return;
            }

            const client = await mongoConnection;
            const db = client.db();
            const _id = ctx.params[options.routeParamsName || 'id'];
            const cursor = db.collection(bucketName + '.files');
            const findOne = options.byId !== false ? cursor.findOne({_id}) : cursor.findOne({filename: _id});

            const doc = await findOne;
            if (!doc) {
                if (options.fallthrough !== false) {
                    await next();
                } else {
                    ctx.throw(404, 'File not found');
                }
                return;
            }
            // create a temp headers
            const headers = makeHeaders(doc, options);
            // check cache
            if (isConditionalGET(ctx.headers) && fresh(ctx.headers, headers)) {
                ctx.status = 304;
                return;
            }
            // range support
            const {ranges, start, end} = makeRanges(ctx, headers, doc.length, options)
            if (ranges === -1) {
                // status already setted by makeRange()
                return;
            }
            // adjust content-length
            headers['content-length'] = end - start;
            // assign the temp headers to res.headers
            Object.keys(headers).forEach(h => ctx.response.get(h) || ctx.set(h, headers[h]));
            if (options.setHeader) options.setHeader(ctx, _id, doc);
            // HEAD support
            if (ctx.method === 'HEAD') {
                return;
            }

            const readStream = new GridFSBucket(db, options)[
                options.byId !== false
                    ? 'openDownloadStream'
                    : 'openDownloadStreamByName'
                ](_id, {start, end})
                .on('error', err => ctx.throw(500, err));

            ctx.body = readStream;
        };
    }

}
