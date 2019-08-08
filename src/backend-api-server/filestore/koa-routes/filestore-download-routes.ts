import {IRouteController} from "../../utils/api/route-controller";
import Router = require("koa-router");
import {Context, Middleware} from "koa";
import {inject, injectable} from "inversify";
import {serveWithRange, StreamAnyMetadata, StreamRange} from "koa-stream";
import {TYPES} from "../../ioc/types";
import {IFileService} from "../api/file-service";
import {IJoiValidationMiddlewareFactory} from "../../utils/api/joi-validation-middleware";
import {fileServeRequestSchema} from "../dto/file-serve-request.schema";

@injectable()
export class FileStoreDownloadController implements IRouteController {

    private readonly router = new Router();

    private fileService: IFileService;

    private resolveStreamMetadata = async (ctx: Context): Promise<StreamAnyMetadata> => {
        debugger;
        const {filename} = ctx.params;
        const fileMetadata = await this.fileService.getStatByName({filename});
        if (!fileMetadata) {
            throw {status: 404};
        }
        return {
            contentType: fileMetadata.contentType || 'application/octet-stream',
            headers: {
                etag: fileMetadata.md5
            },
            length: fileMetadata.length,
        };
    };

    private resolveStream = async (ctx: Context, range?: StreamRange) => {
        debugger;
        const {filename} = ctx.params;
        const stream = await this.fileService.createStreamByName({filename}, range);
        stream.addListener('error', err => {
            debugger;
            console.log(err);
        });
        return stream;
    };

    constructor(
        @inject(TYPES.FileService) fileService: IFileService,
        @inject(TYPES.JoiValidationMiddlewareFactory) joiValidationMiddlewareFactory: IJoiValidationMiddlewareFactory,
    ) {
        this.fileService = fileService;

        this.router.get(
            '/:filename',
            joiValidationMiddlewareFactory({params: fileServeRequestSchema}),
            serveWithRange({
                resolveStreamMetadata: this.resolveStreamMetadata,
                resolveStream: this.resolveStream,
                allowDownload: true,
            })
        );
    }

    getAllowedMethodsMiddleware(options?: Router.IRouterAllowedMethodsOptions): Middleware {
        return this.router.allowedMethods(options);
    }

    getRouteMiddleware(): Middleware {
        return this.router.routes();
    }

}
