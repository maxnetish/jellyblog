import Koa from 'koa';
import appConfig from '../config/app.json';
import {addEntryFromErrorResponse, addEntryFromMorgan} from "./utils-data";
import httpStatuses from "statuses";
import mongoose from "mongoose";
import mongooseConfig from "../config/mongoose";
import applyDataMigrations from "./utils-data/apply-data-mirgations";
import responseTime from 'koa-response-time';
import favicon from 'koa-favicon';
import path from 'path';
import webpackConstants from '../webpack-config/constants';
import staticRouter from './koa-routes/static-assets';
import resourceApiRouter from './koa-routes/resources';
import morgan from 'koa-morgan';
import passport from 'koa-passport';
import session from 'koa-session';
import bodyParser from 'koa-bodyparser';
import requestLanguage from 'koa-request-language';
import {setupPassport} from "./passport/server";
import sessionConfig from './utils/session-config';
import * as i18n from "./i18n";
import routesMap from './../config/routes-map.json';
import BackendResources from 'jb-resources';

const app = new Koa();
const portToListen = process.env.PORT || appConfig.port || 3000;
const urlsNotNeededBackendResources = /(\/api\/|\/file\/|\/assets\/)/;

// Setup mongoose
(async function setupMongo() {
    try {
        // use new createIndex instead of ensureIndex
        mongoose.set('useCreateIndex', true);
        mongoose.Promise = global.Promise;
        const connectionResult = await mongoose.connect(mongooseConfig.connectionUri, Object.assign(mongooseConfig.connectionOptions, {
            promiseLibrary: global.Promise
        }));
        console.info(`Connected to database ${mongooseConfig.connectionUri}`);
        const migrationResult = await applyDataMigrations();
        console.info(migrationResult);
    }
    catch (err) {
        console.error(`Cannot connect to database ${mongooseConfig.connectionUri}, ${err}`);
    }
})();

// setup morgan
(function setupMorgan() {
    morgan.token('user-name', function (req, res) {
        return req.user && req.user.userName;
    });
})();

// to properly work behind nginx
app.proxy = true;

app.key = [appConfig.cookieSecret];

// error response - override default response
app.use(async (ctx, next) => {
    try {
        await next();
    } catch (err) {
        const {req, res, response} = ctx || {};
        let status = typeof err === 'number' ? err : (err.status || err.statusCode || 500);
        addEntryFromErrorResponse(req, res, err);
        if (app.env !== 'development') {
            console.error(err.stack);
        }
        if (err && err.message === 'FileNotFound') {
            status = 404;
        }
        response.status = status;
        response.body = httpStatuses[status] || 'Internal error';
    }
});

// to set X-Response-Time header
app.use(responseTime({hrtime: false}));

// to log requests
app.use(morgan(addEntryFromMorgan));

// to serve favicon requests
app.use(favicon(path.resolve(webpackConstants.dirWWW, 'favicon.ico')));

// to serve static files
app.use(staticRouter.routes());
app.use(staticRouter.allowedMethods());

// setup session and body parser
app.use(session(sessionConfig, app));
// See https://github.com/koajs/bodyparser
// body will be in ctx.request.body
app.use(bodyParser({
    enableTypes: ['json', 'form'], // 'text'
    encoding: 'utf-8',
    formLimit: '56kb',
    jsonLimit: '1mb',
    textLimit: '1mb',
    strict: true,
    detectJSON: null,
    extendTypes: undefined,
    onerror: undefined,
    disableBodyParser: undefined
}));

// adds ctx.language
app.use(requestLanguage({
    // supported langs
    languages: ['en', 'ru'],
    // url query param
    queryName: 'locale'
}));

setupPassport(passport);

// passport adds:
// ctx.isAuthenticated()
// ctx.isUnauthenticated()
// ctx.state.user
app.use(passport.initialize());
app.use(passport.session());

// setup ctx state ("locals" in express response)
app.use(ctx => {
    // localization: state.getText(key) => localized key
    ctx.state.getText = i18n.getTextByLanguage(key, ctx.language);
    ctx.state.language = ctx.language;
    ctx.state.serializedUser = JSON.stringify(ctx.state.user);
    ctx.state.routesMap = routesMap;
    ctx.state.query = ctx.query;
});

// inject backend resources in ctx
// (actually required if request is GET, not api, not file, not static...)
app.use(ctx => {
    if(ctx.method === 'GET') {
        return;
    }
    if(urlsNotNeededBackendResources.test(ctx.url)) {
        return;
    }
    ctx.backendResources = new BackendResources(ctx.state);
});

// to serve api requests
app.use(resourceApiRouter.routes());
app.use(resourceApiRouter.allowedMethods());

// serve admin routes

// General error handler
app.on('error', (err, ctx) => {
    const {req, res} = ctx || {};
    addEntryFromErrorResponse(req, res, err);
    console.error(err.stack);
});

// Run server
app.listen(portToListen, (err, ...others) => {
    if (err) {
        console.error('Failed start server.', err);
    }
    console.info(`Started and listening on port ${portToListen}. app.env: ${app.env}`);
});

export default app;