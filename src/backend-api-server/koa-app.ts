import httpStatuses from 'statuses';
import Router = require('koa-router');
import morgan from 'koa-morgan';
import {IncomingMessage} from "http";
import bodyParser from 'koa-bodyparser';
import cors from '@koa/cors';
import Application = require("koa");
import {ILogService} from "./log/api/log-service";
import {container} from "./ioc/container";
import {TYPES} from "./ioc/types";
import {Middleware} from "koa";
import {IQueryParseMiddlewareFactory} from "./utils/api/query-parse-middleware";
import {IRouteController} from "./utils/api/route-controller";

// TODO избавиться от container.get

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
    const logService = container.get<ILogService>(TYPES.LogService);

    // to properly work behind nginx
    app.proxy = true;

    // error response - override default response
    app.use(async (ctx, next) => {
        try {
            await next();
        } catch (err) {
            const {req, res, response} = ctx;
            let status = typeof err === 'number' ?
                err :
                (err.isJoi ?
                    // exception throws by joi validation assert - wrong parameters
                    400 :
                    (err.status || err.statusCode || 500));
            // addEntryFromErrorResponse(req, res, err);
            // if (status === 500) {
            //     debugger;
            // }
            if (err && err.message === 'FileNotFound') {
                status = 404;
            }
            if (status === 401 || status === 403) {
                // Add WWW-Authenticate header - MUST when  request does not include authentication
                // credentials or does not contain an access token that enables access
                // to the protected resource.
                // See https://tools.ietf.org/html/rfc6750
                ctx.set('WWW-Authenticate', 'Bearer realm="Protected area"');
            }
            if (app.env === 'development') {
                console.error(err.stack);
            }
            response.status = status;
            response.body = httpStatuses[status] || 'Internal error';
        }
    });

    // to log requests in std and mongo
    app.use(koaMorgan('combined'));
    app.use(koaMorgan(logService.addEntryFromMorgan));

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

    // extended query parsing (koa itself does not support nested query strings)
    // will be ctx.state.query
    const queryParseMiddlewareFactory = container.get<IQueryParseMiddlewareFactory>(TYPES.QueryParseMiddlewareFactory);
    app.use(queryParseMiddlewareFactory({
        depth: 2,
        parameterLimit: 16,
        // To parse comma-separated arrays in query.
        // Some client libs (ye, it is angular) serialize arrays like "statuses=ONE,TWO",
        // other (superagent) convert arrays to "statuses=ONE&statuses=TWO"
        // But this feature will be in the next release of qs
        // so we use specific commit git://github.com/ljharb/qs.git#c9720fe
        comma: true
    }));

    // add ctx.state.user
    const authJwtMiddleware: Middleware = container.get<Middleware>(TYPES.AuthMiddleware);
    app.use(authJwtMiddleware);

    // disableBodyParser: undefined

    // setup routes /api/...

    const routesMapPath = process.env.ROUTE_API_PATH || 'api';

    const echoController = container.get<IRouteController>(TYPES.RouteEchoController);
    apiRouter.use(routesMapPath, echoController.getRouteMiddleware(), echoController.getAllowedMethodsMiddleware());

    const tokenController = container.get<IRouteController>(TYPES.RouteTokenController);
    apiRouter.use(routesMapPath, tokenController.getRouteMiddleware(), tokenController.getAllowedMethodsMiddleware());

    const userController = container.get<IRouteController>(TYPES.RouteUserController);
    apiRouter.use(routesMapPath, userController.getRouteMiddleware(), userController.getAllowedMethodsMiddleware());

    app.use(apiRouter.routes());

    return app;
}

