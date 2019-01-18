import Koa from 'koa';
import appConfig from '../config/app.json';
import {addEntryFromErrorResponse, addEntryFromMorgan} from "./utils-data";
import httpStatuses from "statuses";
import responseTime from 'koa-response-time';
import favicon from 'koa-favicon';
import path from 'path';
import webpackConstants from '../webpack-config/constants';
import staticRouter from './koa-routes/static-assets';
import resourceApiRouter from './koa-routes/resources';
import adminRouter from './koa-routes/admin';
import pubRouter from './koa-routes/pub';
import filestoreRouter from './koa-routes/file-store';
import morgan from 'koa-morgan';
import passport from 'koa-passport';
import session from 'koa-session';
import bodyParser from 'koa-bodyparser';
import queryParseMiddlewarFactory from './koa-middleware/query-parse';
// We use lib from git
// See https://github.com/choujimmy/koa-request-language/issues/2
import requestLanguage from 'koa-request-language';
import {setupPassport} from "./passport/server";
import sessionConfig from './utils/session-config';
import * as i18n from "./i18n";
import routesMap from './../config/routes-map.json';
import {resourcesFactory} from 'jb-resources';
import Pug from 'koa-pug';
import cors from '@koa/cors';

const app = new Koa();
const urlsNotNeededBackendResources = /(\/api\/|\/file\/|\/assets\/)/;

// setup pug renderer
const pugInstance = new Pug({
    viewPath: './views',
    debug: app.env === 'development',
    // pretty: true,
    // compileDebug: false,
    locals: {}
    // basedir: 'path/for/pug/extends',
    // helperPath: [
    //     'path/to/pug/helpers',
    //     { random: 'path/to/lib/random.js' },
    //     { _: require('lodash') }
    // ],
});
pugInstance.use(app);

// setup morgan
(function setupMorgan() {
    morgan.token('user-name', function (req, res) {
        return req.user && req.user.userName;
    });
})();

// to properly work behind nginx
app.proxy = true;

app.keys = [appConfig.cookieSecret];

// error response - override default response
app.use(async (ctx, next) => {
    try {
        await next();
    } catch (err) {
        const {req, res, response} = ctx || {};
        let status = typeof err === 'number' ? err : (err.status || err.statusCode || 500);
        addEntryFromErrorResponse(req, res, err);
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

// to set X-Response-Time header
app.use(responseTime({hrtime: false}));

// to log requests
app.use(morgan(addEntryFromMorgan));

// to serve favicon requests
app.use(favicon(path.resolve(webpackConstants.dirWWW, 'favicon.ico')));

// to serve static files
app.use(staticRouter.routes());
app.use(staticRouter.allowedMethods());

// to allow CORS (or not)
if (appConfig.cors) {
    app.use(cors(appConfig.cors));
}

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

// extended query parsing (koa itself does not support nested query strings)
// will be ctx.state.query
app.use(queryParseMiddlewarFactory({
    depth: 2,
    parameterLimit: 16,
}));

// adds ctx.state.language
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
app.use(async (ctx, next) => {
    // localization: state.getText(key) => localized key
    ctx.state.getText = i18n.getTextByLanguage(ctx.state.language);
    ctx.state.serializedUser = JSON.stringify(ctx.state.user);
    ctx.state.routesMap = routesMap;
    await next();
});

// inject backend resources in ctx
// (actually required if request is GET, not api, not file, not static...)
app.use(async (ctx, next) => {
    if (ctx.method === 'GET' && !urlsNotNeededBackendResources.test(ctx.url)) {
        ctx.backendResources = resourcesFactory(ctx.state);
    }
    await next();
});

// file store
app.use(filestoreRouter.routes());
app.use(filestoreRouter.allowedMethods());

// to serve api requests
app.use(resourceApiRouter.routes());
app.use(resourceApiRouter.allowedMethods());

// serve admin routes
app.use(adminRouter.routes());
app.use(adminRouter.allowedMethods());

// serve public routes
app.use(pubRouter.routes());
app.use(pubRouter.allowedMethods());

// General error handler
app.on('error', (err, ctx) => {
    const {req, res} = ctx || {};
    addEntryFromErrorResponse(req, res, err);
    console.error(err.stack);
});

export default app;
