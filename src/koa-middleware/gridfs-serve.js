// stolen from https://github.com/aunz/serve-gridfs

import {GridFSBucket} from 'mongodb';
import fresh from 'fresh';
import parseRange from 'range-parser';

/**
 *
 * @arg {object} options
 *   {
 *     bucketName: {string}, // mongodb default is 'fs'
 *     chunkSizeBytes: {number}, //mongodb default is 255 * 1024
 *     byId: {bool}, default to true, if set to false, will download by filename
 *     cacheControl: {bool|string}, // default not set (not false)
 *     maxAge: {number}, // default to 0
 *     etag: {bool}, // default not set (not false)
 *     lastModified: {bool}, // default not set (not false)
 *     acceptRanges: {bool}, // default not set (not false)
 *     fallthrough: {bool}, // default none (not false)
 *     setHeader: {fn}, // default none, signature: function setHeader(ctx, path, stat) {
 *       path is the req.url file
 *       stat is the info from mongodb fs.files if the file is present
 *     },
 *     routeParamsName: {string} // name of parameter in ctx.params with file id or name, default is 'id'
 *   }
 */

export default function serveGridfs(mongoConnection, options = {}) {
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
    }
}

function makeHeaders(doc, options) {
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

function makeRanges(ctx, headers, len, options) {
    let ranges = ctx.headers.range;
    let start = 0;
    let end = len;
    if (options.acceptRanges !== false && /^ *bytes=/.test(ranges)) { // BYTES_RANGE_REGEXP
        ranges = parseRange(len, ranges, {combine: true});

        if (!isRangeFresh(ctx.headers.range, headers)) ranges = -2;

        if (ranges === -1) {
            ctx.set('Content-Range', contentRange('bytes', end));
            // 416 Requested Range Not Satisfiable
            ctx.status = 416;
        }

        // valid (syntactically invalid/multiple ranges are treated as a regular response)
        if (ranges !== -2 && ranges.length === 1) {
            // Content-Range
            ctx.status = 206;
            ctx.set('content-range', contentRange('bytes', end, ranges[0]));
            // adjust for requested range
            start += ranges[0].start;
            end = ranges[0].end + 1;
        }
    }
    return {ranges, start, end};
}

function isConditionalGET(reqHeaders) {
    return reqHeaders['if-none-match'] || reqHeaders['if-modified-since'];
}

function isRangeFresh(reqHeader, resHeader) { // eslint-disable-line no-inner-declarations
    const ifRange = reqHeader['if-range'];
    if (!ifRange) return true;
    return ~ifRange.indexOf('"') // eslint-disable-line no-bitwise
        ? ~ifRange.indexOf(resHeader['etag']) // eslint-disable-line no-bitwise
        : Date.parse(resHeader['last-modified']) <= Date.parse(ifRange);
}

function contentRange(type, size, range) { // eslint-disable-line no-inner-declarations
    return type + ' ' + (range ? range.start + '-' + range.end : '*') + '/' + size;
}