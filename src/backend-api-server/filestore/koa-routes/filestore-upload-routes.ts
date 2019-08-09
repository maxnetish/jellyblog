import {IRouteController} from "../../utils/api/route-controller";
import Router = require("koa-router");
import {Middleware, Request} from "koa";
import {inject, injectable} from "inversify";
import {TYPES} from "../../ioc/types";
import {IFileService} from "../api/file-service";
import {IJoiValidationMiddlewareFactory} from "../../utils/api/joi-validation-middleware";
import {fileServeRequestSchema} from "../dto/file-serve-request.schema";
import {IUserAuthorizeMiddlewareFactory} from "../../auth/api/user-authorize-middleware-factory";
import multer = require("koa-multer");
import mongoose from "mongoose";
import MulterGridfsStorage = require("multer-gridfs-storage");
// import 'koa-bodyparser';
import 'multer';



@injectable()
export class FileStoreUploadController implements IRouteController {

    private readonly router = new Router();

    private fileService: IFileService;

    constructor(
        @inject(TYPES.FileService) fileService: IFileService,
        @inject(TYPES.UserAuthorizeMiddlewareFactory) userAuthorizeMiddlewareFactory: IUserAuthorizeMiddlewareFactory,
        @inject(TYPES.JoiValidationMiddlewareFactory) joiValidationMiddlewareFactory: IJoiValidationMiddlewareFactory,
    ) {
        this.fileService = fileService;

        this.router.post(
            '/',
            userAuthorizeMiddlewareFactory([{role: ['admin']}]),
            multer({
                storage: new MulterGridfsStorage({
                    url: '',

                    options: {useNewUrlParser: true},
                    // file: (req, file) => {
                    //     // danger!
                    //     const reqAsRequest = req as Request;
                    //     return {
                    //         metadata: {
                    //             context: reqAsRequest.body && reqAsRequest.body.context,
                    //             postId: (reqAsRequest.body && reqAsRequest.body.postId) ? new mongoose.mongo.ObjectId(reqAsRequest.body.postId) : undefined,
                    //             originalName: file.originalname,
                    //             width: (reqAsRequest.body && reqAsRequest.body.width) ? reqAsRequest.body.width : undefined,
                    //             height: (reqAsRequest.body && reqAsRequest.body.height) ? reqAsRequest.body.height : undefined,
                    //             description: (reqAsRequest.body && reqAsRequest.body.description) ? reqAsRequest.body.description : undefined,
                    //             srcsetTag: (reqAsRequest.body && reqAsRequest.body.srcsetTag) ? reqAsRequest.body.srcsetTag : undefined
                    //         }
                    //     };
                    // },
                    // log: true,
                    // logLevel: 'file'
                }),
                limits: {
                    fields: 8,
                    fileSize: 134217728,
                    files: 10
                }
            }).fields([
                {
                    "name": "attachment",
                    "maxCount": 3
                },
                {
                    "name": "avatarImage",
                    "maxCount": 1
                },
                {
                    "name": "upload",
                    "maxCount": 3
                }
            ])
        );
    }

    getAllowedMethodsMiddleware(options?: Router.IRouterAllowedMethodsOptions): Middleware {
        return this.router.allowedMethods(options);
    }

    getRouteMiddleware(): Middleware {
        return this.router.routes();
    }

}
