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
import morgan from 'koa-morgan';
import passport from 'koa-passport';
import session from 'koa-session';
import bodyParser from 'koa-bodyparser';
import {setupPassport} from "./passport/server";

const app = new Koa();
const portToListen = process.env.PORT || appConfig.port || 3000;

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
app.use(session(app));
app.use(bodyParser());

setupPassport(passport);

app.use(passport.initialize());
app.use(passport.session());

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