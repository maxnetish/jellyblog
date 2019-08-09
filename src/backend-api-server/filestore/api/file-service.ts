import {IResponseWithPagination} from "../../utils/dto/response-with-pagination";
import {IFileMulterGridfsInfo} from "../dto/file-multer-gridfs-info";
import {IFileFindCriteria} from "../dto/file-find-criteria";
import {IFileRemoveRequest} from "../dto/file-remove-request";
import {IWithUserContext} from "../../auth/dto/with-user-context";
import {IFileServeRequest} from "../dto/file-serve-request";
import {StreamRange} from "koa-stream";
import {Stream} from "stream";

export interface IFileService {
    find(criteria: IFileFindCriteria, options: IWithUserContext): Promise<IResponseWithPagination<IFileMulterGridfsInfo>>;
    remove(fileRemoveRequest: IFileRemoveRequest, options: IWithUserContext): Promise<number>;
    getStatByName(criteria: IFileServeRequest): Promise<IFileMulterGridfsInfo | null>;
    createStreamByName(criteria: IFileServeRequest, range?: StreamRange): Promise<Stream> | Stream;
}
