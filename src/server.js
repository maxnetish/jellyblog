import express from 'express';
import path from 'path';
import urljoin from 'url-join';
import favicon from 'serve-favicon';
import mongoose from 'mongoose';
import morgan from 'morgan';
import moment from 'moment';
import bodyParser from 'body-parser';
import responseTime from 'response-time';
import serveStatic from 'serve-static';
import session from 'express-session';
import passport from 'passport';
import {setupPassport} from './passport/server';
import multer from 'multer';
import MulterGridfsStorage from 'multer-gridfs-storage';
import {MongoClient} from 'mongodb';
import serveGridfs from 'serve-gridfs';
import cookieParser from 'cookie-parser';
import requestLanguage from 'express-request-language';
import morphine from './resources';
import httpStatuses from 'statuses';
import mongooseConfig from '../config/mongoose.json';
import fileStoreConfig from '../config/file-store.json';
import routesMap from '../config/routes-map.json';
import {addEntryFromMorgan, addEntryFromErrorResponse} from './utils-data';
import createPaginationModel from './utils/create-pagination-model';
import createTagsCloudModel from './utils/create-tags-cloude-model';
import flash from 'express-flash';
import * as i18n from './i18n'

const app = express();
const resources = morphine;

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
app.set('view engine', 'pug');
app.set('views', './views');
app.use(favicon(path.join(__dirname, 'pub/favicon.ico')));
app.use(responseTime());
// setup logger
morgan.token('user-name', function (req, res) {
    return req.user && req.user.userName;
});
app.use(morgan(addEntryFromMorgan));
app.use(bodyParser.urlencoded({limit: '5mb', extended: false}));
app.use(bodyParser.json({limit: '5mb'}));
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
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());

/**
 * fill locals to pass it to view
 */
app.use((req, res, next) => {
    res.locals.getText = key => i18n.getText(key, req.language);
    res.locals.dateTimeToLocaleString = function ({date, format = 'LL'} = {}) {
        if (!date) {
            return null;
        }
        moment.locale(req.language);
        return moment(date).format(format);
    };
    res.locals.language = req.language;
    res.locals.user = req.user;
    res.locals.routesMap = routesMap;
    next();
});

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
            height: (req.body && req.body.height) ? req.body.height : undefined,
            description: (req.body && req.body.description) ? req.body.description : undefined,
            srcsetTag: (req.body && req.body.srcsetTag) ? req.body.srcsetTag : undefined
        };
        cb(null, meta);
    },
    log: true,
    logLevel: 'file'
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
    },
    {
        name: 'srcset',
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
const contentTypeToShowInline = /^(image|video|text)\//;
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
            if (!(stat.contentType && (contentTypeToShowInline.test(stat.contentType)))) {
                // For video/image not set Content-Type so browser should show these files inline
                // For other browser should prompt to download file
                res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(stat.metadata.originalName)}"`);
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
 * admin area
 */
app.get(routesMap.admin, (req, res) => {
    // admin area, require auth
    if (req.user && req.user.role === 'admin') {
        res.render('admin/index', {});
    } else {
        res.render('admin/login', {});
    }
});
app.get(routesMap.login, (req, res) => {
    if (req.user && req.user.role === 'admin') {
        res.redirect(routesMap.admin);
    } else {
        res.render('admin/login', {});
    }
});
app.post(routesMap.login,
    passport.authenticate('local', {
        successRedirect: '/admin',
        failureRedirect: '/admin/login',
        failureFlash: true
    })
);
app.get(routesMap.logout, (req, res) => {
    if (req.user) {
        req.logout();
        res.redirect(req.query.next || '/');
    } else {
        res.send(400);
    }
});

/**
 * Preview of post (include DRAFT)
 */
app.get(routesMap.preview + '/:id', (req, res, next) => {
    // admin area, require auth
    if (!(req.user && req.user.role === 'admin')) {
        next(403);
        return;
    }

    Promise.all([
        resources.post.pubGet({id: req.params.id, allowDraft: true}),
        resources.tag.list()
    ])
        .then(responses => {
            let post = responses[0];
            let tags = createTagsCloudModel(responses[1]);
            let locals = Object.assign({}, {post}, {tags});
            res.render('pub/post', locals);
        }, err => next(err));

});

/**
 * Page /post/12344...
 */
app.get(routesMap.post + '/:id', (req, res, next) => {
    Promise.all([
        resources.post.pubGet({id: req.params.id}),
        resources.tag.list()
    ])
        .then(responses => {
            let post = responses[0];
            let tags = createTagsCloudModel(responses[1]);
            let locals = Object.assign({}, {post}, {tags});
            res.render('pub/post', locals);
        }, err => next(err));
});

/**
 * Page /tag/coolposts...
 */
app.get(routesMap.tag + '/:tag', (req, res, next) => {
    Promise.all([
        resources.post.pubList({
            page: req.query.page,
            postsPerPage: 5,
            q: req.query.q,
            tag: req.params.tag
        }),
        resources.tag.list()
    ])
        .then(responses => {
            let findPosts = responses[0];
            let tags = createTagsCloudModel(responses[1]);
            let pagination = createPaginationModel({
                currentUrl: req.url,
                currentPage: findPosts.page,
                hasMore: findPosts.hasMore
            });
            let locals = Object.assign({}, findPosts, {tags}, {pagination});

            res.render('pub/tag', locals);
        }, err => next(err));
});

/**
 * Main entry
 */
app.get(['/'], (req, res, next) => {
    Promise.all([
        resources.post.pubList({
            page: req.query.page,
            postsPerPage: 5,
            q: req.query.q
        }),
        resources.tag.list()
    ])
        .then(responses => {
            let findPosts = responses[0];
            let tags = createTagsCloudModel(responses[1]);
            let pagination = createPaginationModel({
                currentUrl: req.url,
                currentPage: findPosts.page,
                hasMore: findPosts.hasMore
            });
            let locals = Object.assign({}, findPosts, {tags}, {pagination});

            res.render('pub/index', locals);
        }, err => next(err));
});

/**
 * General error
 */
app.use(function (err, req, res, next) {
    addEntryFromErrorResponse(req, res, err);
    console.error(err.stack);
    let status = typeof err === 'number' ? err : 500;
    res.status(status).send(httpStatuses[status] || 'Internal error');
});

/**
 * begin listen port
 */
let portToListen = process.env.PORT || 3000;
app.listen(portToListen, function () {
    console.info(`${app.name} started and listening on port ${portToListen}`);
});

export default app;