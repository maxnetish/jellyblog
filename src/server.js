import express from 'express';
import path from 'path';
import urljoin from 'url-join';
import favicon from 'serve-favicon';
import mongoose from 'mongoose';

import morgan from 'morgan';
import bodyParser from 'body-parser';
import responseTime from 'response-time';
import serveStatic from 'serve-static';
import session from 'express-session';
import passport from 'passport';
import {setupPassport} from './passport/server';
// import {Strategy} from 'passport-local';

import multer from 'multer';
import MulterGridfsStorage from 'multer-gridfs-storage';
import {MongoClient} from 'mongodb';
import serveGridfs from 'serve-gridfs';

import cookieParser from 'cookie-parser';
import requestLanguage from 'express-request-language';

import morphine from './resources';
import mongooseConfig from '../config/mongoose.json';
import fileStoreConfig from '../config/file-store.json';
import {expressRouteHandler} from './isomorph-utils/server';
import {addEntryFromMorgan, addEntryFromErrorResponse} from './utils-data';

const app = express();

/**
 * Setup passport
 */
setupPassport(passport);

/**
 * setup mongoose
 */
mongoose.Promise = global.Promise;
mongoose.connect(mongooseConfig.connectionUri, Object.assign(mongooseConfig.connectionOptions, {promiseLibrary: global.Promise}))
    .then(function (response) {
        console.info(`Connected to database ${mongooseConfig.connectionUri}`);
        return response;
    })
    .catch(function (err) {
        console.error(`Cannot connect to database ${mongooseConfig.connectionUri}, ${err}`);
    });

/**
 * setup app
 */
// to properly work behind nginx
app.set("trust proxy", true);
app.use(favicon(path.join(__dirname, 'pub/favicon.ico')));
app.use(responseTime());
// setup logger
morgan.token('user-name', function (req, res) { return req.user && req.user.userName; });
app.use(morgan(addEntryFromMorgan));
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use(cookieParser());
// adds req.language
app.use(requestLanguage({
    // supported langs
    languages: ['en', 'ru'],
    // url query param
    queryName: 'locale'
}));
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
 * setup upload endpoint
 */
const gridFsStorage = MulterGridfsStorage({
    url: mongooseConfig.connectionUri,
    metadata: (req, file, cb) => {
        let meta = {
            context: req.body && req.body.context,
            postId: (req.body && req.body.postId) ? new mongoose.mongo.ObjectId(req.body.postId) : undefined,
            originalName: file.originalname,
            width: (req.body && req.body.width) ? req.body.width : undefined,
            height: (req.body && req.body.height) ? req.body.height : undefined
        };
        cb(null, meta);
    },
    log: true,
    logLevel: 'all'
});
const uploadMiddleware = multer({
    storage: gridFsStorage,
    fileFilter: (req, file, cb) => {
        if (!(req.user && req.user.role === 'admin')) {
            cb(null, false);
            return;
        }

        cb(null, true);
    },
    limits: {
        fields: 8,
        fileSize: 134217728,
        files: 10
    }
});
const uploadMiddlewareAttachment = uploadMiddleware.fields([
    {
        name: 'attachment',
        maxCount: 10
    },
    {
        name: 'avatarImage',
        maxCount: 1
    }
]);
app.post('/upload', uploadMiddlewareAttachment, (req, res) => {
    let filesByFieldname = Object.assign({}, req.files || {});
    for (let fieldName in filesByFieldname) {
        if (filesByFieldname.hasOwnProperty(fieldName)) {
            filesByFieldname[fieldName] = filesByFieldname[fieldName].map(f => {
                f.grid.url = urljoin(fileStoreConfig.gridFsBaseUrl, f.filename);
                return f;
            });
        }
    }
    res.send({
        files: filesByFieldname
    });
});

/**
 * setup static serve from gridfs
 *
 */
const mongoConnectionForServeGridFs = MongoClient.connect(mongooseConfig.connectionUri);
const serveGridFsByNamemiddleware = serveGridfs(mongoConnectionForServeGridFs, {
    // bucketName: 'fs'
    // serve-gridfs assumes that _id will be String (not ObjectId)
    // so serve files by names
    byId: false,
    acceptRanges: true,
    cacheControl: true,
    maxAge: 86400,
    etag: true,
    // serve-gridfs internally use Date.toString() which could produce string with non-ascii chars,
    // so we use custom implementation in setHeader option
    lastModified: false,
    fallthrough: false,
    setHeader: (res, path, stat) => {
        if (stat && stat.uploadDate) {
            let uploadDateAsISO = (new Date(stat.uploadDate)).toISOString();
            res.setHeader('last-modified', uploadDateAsISO);
            if (!(stat.contentType && (stat.contentType.startsWith('image') || stat.contentType.startsWith('video')))) {
                // For video/image not set Content-Type so browser should show these files inline
                // For other browser should prompt to download file
                res.setHeader('Content-Disposition', `attachment; filename="${stat.metadata.originalName}"`);
            }
        }
    }
});
app.use(fileStoreConfig.gridFsBaseUrl, serveGridFsByNamemiddleware);

/**
 * bind isomorhine RPC-like interface
 */
app.use(morphine.router);

/**
 * Main entry
 */
app.get(['/', '/*'], expressRouteHandler);

app.use(function (err, req, res, next) {
    addEntryFromErrorResponse(req, res, err);
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