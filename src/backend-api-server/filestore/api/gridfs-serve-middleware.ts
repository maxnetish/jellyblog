import {ConnectionBase} from "mongoose";
import {Context, Middleware} from "koa";
import {GridFSBucketOptions} from "mongodb";

export interface IGridfsServeMiddlewareOptions extends GridFSBucketOptions {
    // default true
    byId?: boolean;
    // default not false
    cacheControl?: boolean | string;
    // default 0
    maxAge?: number;
    // default not false
    etag?: boolean;
    // default not false
    lastModified?: boolean;
    // default not false
    acceptRanges?: boolean;
    // default not false
    fallthrough?: boolean;
    setHeader?: (ctx: Context, path: string, stat: any) => void;
    // name of parameter in ctx.params with file id or name, default is 'id'
    routeParamsName?: string
}

export interface IGridfsServeMiddlewareFactory {
    middleware(connection: ConnectionBase, options: IGridfsServeMiddlewareOptions): Middleware;
}
