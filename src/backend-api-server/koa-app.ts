import httpStatuses from 'statuses';
import Router = require('koa-router');
import morgan, {KoaMorgan} from 'koa-morgan';
import bodyParser from 'koa-bodyparser';
import cors from '@koa/cors';
import Application = require("koa");
import {ILogService} from "./log/api/log-service";
import {TYPES} from "./ioc/types";
import {Middleware} from "koa";
import {IQueryParseMiddlewareFactory} from "./utils/api/query-parse-middleware";
import {IRouteController} from "./utils/api/route-controller";
import {IAuthenticatedUserFromJwtResolver} from "./auth/api/authenticated-user-from-jwt-resolver";
import {inject, injectable} from "inversify";
import {IAppBuilder} from "./app-builder";
import mongoose = require('mongoose');

@injectable()
export class AppBuilder implements IAppBuilder {

    private logService: ILogService;
    private queryParseMiddlewareFactory: IQueryParseMiddlewareFactory;
    private authJwtResolver: IAuthenticatedUserFromJwtResolver;
    private routeControllers: IRouteController[];
    private fsControllers: IRouteController[];

    constructor(
        @inject(TYPES.LogService) logService: ILogService,
        @inject(TYPES.QueryParseMiddlewareFactory) queryParseMiddlewareFactory: IQueryParseMiddlewareFactory,
        @inject(TYPES.AuthMiddleware) authJwtResolver: IAuthenticatedUserFromJwtResolver,
        @inject(TYPES.RouteControllers) routeControllers: IRouteController[],
        @inject(TYPES.RouteGridFsController) fsControllers: IRouteController[],
    ) {
        this.logService = logService;
        this.queryParseMiddlewareFactory = queryParseMiddlewareFactory;
        this.authJwtResolver = authJwtResolver;
        this.routeControllers = routeControllers;
        this.fsControllers = fsControllers;
    }

    // error response - override default response
    private errorResponseMiddlewareFactory({includeStack = true}: { includeStack?: boolean } = {}): Middleware {
        return async (ctx, next) => {
            try {
                await next();
            } catch (err) {
                const {response} = ctx;
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
                // if (err.isJoi) {
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
                if (includeStack) {
                    console.error(err.stack);
                }
                response.status = status;
                response.body = httpStatuses[status] || 'Internal error';
            }
        };
    }

    private initMorganLogger(): KoaMorgan {
        return morgan
            .token('user-name', (req: any) => {
                if (req.user && typeof req.user.username === 'string') {
                    return req.user && req.user.username;
                }
                return '';
            })
            .token('realRemoteAddress', (req: any) => {
                let res = req.headers['x-real-ip'] || (req.connection && req.connection.remoteAddress);
                if (Array.isArray(res)) {
                    res = res.join();
                }
                res = res || '';
                return res;
            });
    }

    private buildApiRouter(): Router {
        const routesMapPath = process.env.ROUTE_API_PATH || '/api';
        const apiRouter = new Router();

        this.routeControllers.forEach(controller => {
            apiRouter.use(routesMapPath, controller.getRouteMiddleware(), controller.getAllowedMethodsMiddleware());
        });
        return apiRouter;
    }

    private buildFsRouter(): Router {
        const fsRoutesPath = process.env.JB_GRIDFS_BASEURL || '/file';
        const fsRouter = new Router();

        this.fsControllers.forEach(controller => {
            fsRouter.use(fsRoutesPath, controller.getRouteMiddleware(), controller.getAllowedMethodsMiddleware());
        });
        return fsRouter;
    }

    private async initMongooseConnection() {
        const dbConfig = {
            connectionUri: process.env.DB_CONNECTION_URI || 'mongodb://localhost/jellyblog',
            connectionOptions: {
                config: {
                    autoIndex: true,
                },
                promiseLibrary: Promise,
                useNewUrlParser: true,
            },
            paginationDefaultLimit: parseInt(process.env.DB_DEFAULT_PAGINATION || '10', 10),
            commandDump: process.env.DB_CMD_DUMP || 'mongodump -d jellyblog --quiet --gzip --archive',
            dumpFilename: process.env.DB_DUMP_FILENAME || 'blog.archive.gz',
            commandRestore: process.env.DB_CMD_RESTORE || 'mongorestore --nsFrom jellyblog.* --nsTo jellyblog-check-restore.* --gzip',
        };
        try {
            // use new createIndex instead of ensureIndex
            mongoose.set('useCreateIndex', true);
            // https://mongoosejs.com/docs/deprecations.html#-findandmodify-
            mongoose.set('useFindAndModify', false);
            const connectionResult = await mongoose.connect(dbConfig.connectionUri, dbConfig.connectionOptions);
            console.info(`Connected to database ${dbConfig.connectionUri}`);
            // TODO rewrite migrations
            // const migrationResult = await applyDataMigrations({migrations});
            // console.info(migrationResult);
            return connectionResult;
        } catch (err) {
            console.error(`Cannot connect to database ${dbConfig.connectionUri}, ${err}`);
            throw err;
        }
    }

    async createApp(): Promise<Application> {
        const app = new Application();

        // setup mongoose connection
        await this.initMongooseConnection();

        // to properly work behind nginx
        app.proxy = true;

        // error response - override default response
        app.use(this.errorResponseMiddlewareFactory({
            // includeStack: app.env === 'development' || app.env === 'test',
            includeStack: app.env === 'development',
        }));

        // setup logging: to console and to logService
        const koaMorgan = this.initMorganLogger();
        if (app.env === 'development') {
            // to not spamming in test and prod console
            app.use(koaMorgan('combined'));
        }
        if (app.env !== 'test') {
            // to not store log in test mode
            app.use(koaMorgan(this.logService.addEntryFromMorgan));
        }

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
        }));

        // extended query parsing (koa itself does not support nested query strings)
        // will be ctx.state.query
        app.use(this.queryParseMiddlewareFactory({
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
        app.use(this.authJwtResolver.middleware);

        // add fs routes
        app.use(this.buildFsRouter().routes());

        // and http routes
        app.use(this.buildApiRouter().routes());

        return app;
    }
}

