import express from 'express';
import path from 'path';
import favicon from 'serve-favicon';
// import mongoose from 'mongoose';

import bodyParser from 'body-parser';
import responseTime from 'response-time';
import serveStatic from 'serve-static';
import session from 'express-session';
import passport from 'passport';
import {setupPassport} from './passport/server';
// import {Strategy} from 'passport-local';

import cookieParser from 'cookie-parser';

import morphine from './resources';
import {expressRouteHandler} from './isomorph-utils/server';

var app = express();

/**
 * Setup passport
 */
setupPassport(passport);

/**
 * setup mongoose
 */
// mongoose.Promise = global.Promise;
// mongoose.connect(mongooseConfig.connectionUri, Object.assign(mongooseConfig.connectionOptions, {promiseLibrary: global.Promise}))
//     .then(function (response) {
//         console.info(`Connected to database ${mongooseConfig.connectionUri}`);
//         return response;
//     })
//     .catch(function (err) {
//         console.error(`Cannot connect to database ${mongooseConfig.connectionUri}, ${err}`);
//     });

/**
 * setup app
 */
app.use(favicon(path.join(__dirname, 'pub/favicon.ico')));
app.use(responseTime());
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(session({
    cookie: {
        httpOnly: true,
    },
    name: 'jellyblog.id',
    proxy: true,
    secret: 'À la fin de 1980, il rencontre à l’université',
    resave: true,
    saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session());

/**
 * assets will be in build/pub, virtual path will be '/assets/bla-bla.js'
 */
app.use('/assets', serveStatic(path.join(__dirname, 'pub'), {
    index: false
}));

/**
 * bind isomorhine RPC-like interface
 */
app.use(morphine.router);

/**
 * Main entry
 */
app.get(['/', '/*'], expressRouteHandler);

app.use(function (err, req, res, next) {
    console.error(err.stack);
    let status = typeof err === 'number' ? err : 500;
    res.status(status).send('Internal error');
});

/**
 * begin listen port
 */
let portToListen = process.env.PORT || 3000;
app.listen(portToListen, function () {
    console.info(`${app.name} started and listening on port ${portToListen}`);
});

export default app;