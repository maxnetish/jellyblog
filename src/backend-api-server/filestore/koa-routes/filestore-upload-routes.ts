import {IRouteController} from "../../utils/api/route-controller";
import Router = require("koa-router");
import {Middleware, Request} from "koa";
import {inject, injectable} from "inversify";
import {TYPES} from "../../ioc/types";
import {IFileService} from "../api/file-service";
import {IJoiValidationMiddlewareFactory} from "../../utils/api/joi-validation-middleware";
import {IUserAuthorizeMiddlewareFactory} from "../../auth/api/user-authorize-middleware-factory";
import multer = require('koa-multer');
import mongoose, {Model} from "mongoose";
import MulterGridfsStorage = require("multer-gridfs-storage");
import {StorageEngine} from "koa-multer";
import {IncomingMessage} from "http";

// TODO придумать и написать тест
@injectable()
export class FileStoreUploadController implements IRouteController {

    private readonly router = new Router();

    private fileService: IFileService;

    private FileDataModel: Model<any>;

    constructor(
        @inject(TYPES.FileService) fileService: IFileService,
        @inject(TYPES.UserAuthorizeMiddlewareFactory) userAuthorizeMiddlewareFactory: IUserAuthorizeMiddlewareFactory,
        @inject(TYPES.JoiValidationMiddlewareFactory) joiValidationMiddlewareFactory: IJoiValidationMiddlewareFactory,
        @inject(TYPES.ModelFileData) FileDataModel: Model<any>,
    ) {
        this.fileService = fileService;

        const expressStorageEngine = new MulterGridfsStorage({
            db: this.FileDataModel.collection.conn,
            file: (req, file) => {
                // danger!
                // it is dirty typing in koa-multer so cast any -> request
                // const reqAsRequest = req as Request;
                const reqAsRequest = req as any as Request;
                return {
                    metadata: {
                        context: reqAsRequest.body && reqAsRequest.body.context,
                        postId: (reqAsRequest.body && reqAsRequest.body.postId)
                            ? new mongoose.mongo.ObjectId(reqAsRequest.body.postId)
                            : undefined,
                        originalName: file.originalname,
                        width: (reqAsRequest.body && reqAsRequest.body.width) ? reqAsRequest.body.width : undefined,
                        height: (reqAsRequest.body && reqAsRequest.body.height) ? reqAsRequest.body.height : undefined,
                        description: (reqAsRequest.body && reqAsRequest.body.description)
                            ? reqAsRequest.body.description
                            : undefined,
                        srcsetTag: (reqAsRequest.body && reqAsRequest.body.srcsetTag)
                            ? reqAsRequest.body.srcsetTag
                            : undefined,
                    },
                };
            },
        });
        // Sorry for ugly casting
        const storage: StorageEngine = {
            _handleFile(req: IncomingMessage, file: multer.File, callback: (error?: any, info?: multer.File) => void)
                : void {
                return expressStorageEngine._handleFile(
                    req as any as Express.Request,
                    file as Express.Multer.File,
                    callback,
                );
            },
            _removeFile(req: IncomingMessage, file: multer.File, callback: (error: Error) => void)
                : void {
                return expressStorageEngine._removeFile(
                    req as any as Express.Request,
                    file as Express.Multer.File,
                    callback,
                );
            },
        };

        this.router.post(
            '/',
            userAuthorizeMiddlewareFactory([{role: ['admin']}]),
            multer({
                storage,
                limits: {
                    fields: 8,
                    fileSize: 134217728,
                    files: 10,
                },
            }).fields([
                {
                    name: 'attachment',
                    maxCount: 3,
                },
                {
                    name: 'avatarImage',
                    maxCount: 1,
                },
                {
                    name: 'upload',
                    maxCount: 3,
                },
            ]),
        );
    }

    public getAllowedMethodsMiddleware(options?: Router.IRouterAllowedMethodsOptions): Middleware {
        return this.router.allowedMethods(options);
    }

    public getRouteMiddleware(): Middleware {
        return this.router.routes();
    }

}
