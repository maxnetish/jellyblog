import {router as echoRouter} from './echo/echo';
import {router as tokenRouter} from './token/token-routes';
import httpStatuses from 'statuses';
import Router = require('koa-router');
import morgan from 'koa-morgan';
import {IncomingMessage, ServerResponse} from "http";
import {addEntryFromMorgan} from "./log/log-service";
import bodyParser from 'koa-bodyparser';
import cors from '@koa/cors';
import Application = require("koa");

export function createApp(): Application {
    const app = new Application();
    const apiRouter = new Router();

    // setup morgan
    const koaMorgan = morgan
        .token('user-name', (req: any) => {
            if (req.user && typeof req.user.userName === 'string') {
                return req.user && req.user.userName;
            }
            return '';
        })
        .token('realRemoteAddress', (req: IncomingMessage) => {
            let res = req.headers['x-real-ip'] || (req.connection && req.connection.remoteAddress);
            if (Array.isArray(res)) {
                res = res.join();
            }
            res = res || '';
            return res;
        });

    // to properly work behind nginx
    app.proxy = true;

    // error response - override default response
    app.use(async (ctx, next) => {
        try {
            await next();
        } catch (err) {
            const {req, res, response} = ctx;
            let status = typeof err === 'number' ? err : (err.status || err.statusCode || 500);
            // addEntryFromErrorResponse(req, res, err);
            if (app.env === 'development') {
                console.error(err.stack);
            }
            if (err && err.message === 'FileNotFound') {
                status = 404;
            }
            response.status = status;
            response.body = httpStatuses[status] || 'Internal error';
        }
    });

    // to log requests in std and mongo
    app.use(koaMorgan('combined'));
    app.use(koaMorgan(addEntryFromMorgan));

    // to allow CORS (or not)
    if (process.env.CORS_ORIGIN) {
        app.use(cors({
            maxAge: 3600,
            credentials: true,
            origin: process.env.CORS_ORIGIN,
        }));
    }

    // See https://github.com/koajs/bodyparser
    // body will be in ctx.request.body
    app.use(bodyParser({
        enableTypes: ['json', 'form'], // 'text'
        encode: 'utf-8',
        formLimit: '56kb',
        jsonLimit: '1mb',
        textLimit: '1mb',
        strict: true,
        detectJSON: undefined,
        extendTypes: undefined,
        onerror: undefined
    }));

    // disableBodyParser: undefined

    // setup routes /api/...

    const routesMapPath = process.env.ROUTE_API_PATH || 'api';
    apiRouter.use(routesMapPath, echoRouter.routes(), echoRouter.allowedMethods());
    apiRouter.use(routesMapPath, tokenRouter.routes(), tokenRouter.allowedMethods());

    app.use(apiRouter.routes());

    return app;
}

