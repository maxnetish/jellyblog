import Router from 'koa-router';
import MulterGridfsStorage from "multer-gridfs-storage";
import mongooseConfig from "../../config/mongoose";
import mongoose from "mongoose";
import multer from "koa-multer";
import fileStoreConfig from "../../config/file-store";
import routesMap from "../../config/routes-map";
import urljoin from "url-join";
import checkPermissions from "../koa-middleware/check-permission";
import {MongoClient} from "mongodb";
import serveGridfs from "../koa-middleware/gridfs-serve";

const router = new Router();

/********************************************
 * Setup uploads
 */
const checkAdminPermissions = checkPermissions({roles: ['admin']});
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
    limits: {
        fields: 8,
        fileSize: 134217728,
        files: 10
    }
});
const uploadMiddlewareAttachment = uploadMiddleware.fields(fileStoreConfig.fields);

router
    .post('fileUpload', routesMap.upload,
        checkAdminPermissions,
        uploadMiddlewareAttachment,
        ctx => {
            const filesByFieldname = Object.assign({}, ctx.files || {});
            for (let fieldName in filesByFieldname) {
                if (filesByFieldname.hasOwnProperty(fieldName)) {
                    filesByFieldname[fieldName] = filesByFieldname[fieldName].map(f => {
                        f.grid.url = urljoin(fileStoreConfig.gridFsBaseUrl, f.filename);
                        return f;
                    });
                }
            }
            ctx.body = {
                files: filesByFieldname
            };
        });

/****************************************/

/*****************************************
 * setup static serve from gridfs
 *
 */
const mongoConnectionForServeGridFs = MongoClient.connect(mongooseConfig.connectionUri);
const contentTypeToShowInline = /^(image|video|text)\//;
const serveGridFsByNameMiddleware = serveGridfs(mongoConnectionForServeGridFs, {
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
    setHeader: (ctx, path, stat) => {
        if (stat && stat.uploadDate) {
            let uploadDateAsISO = (new Date(stat.uploadDate)).toISOString();
            ctx.set('last-modified', uploadDateAsISO);
            if (!(stat.contentType && (contentTypeToShowInline.test(stat.contentType)))) {
                // For video/image not set Content-Type so browser should show these files inline
                // For other browser should prompt to download file
                ctx.set('Content-Disposition', `attachment; filename="${encodeURIComponent(stat.metadata.originalName)}"`);
            }
        }
    }
});

router.all(fileStoreConfig.gridFsBaseUrl, serveGridFsByNameMiddleware);
/****************************************************************/

export default router;