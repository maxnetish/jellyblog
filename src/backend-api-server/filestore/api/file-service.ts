import {IResponseWithPagination} from "../../utils/dto/response-with-pagination";
import {IFileMulterGridfsInfo} from "../dto/file-multer-gridfs-info";
import {IFileFindCriteria} from "../dto/file-find-criteria";
import {IFileRemoveRequest} from "../dto/file-remove-request";
import {IWithUserContext} from "../../auth/dto/with-user-context";

export interface IFileService {
    find(criteria: IFileFindCriteria, options: IWithUserContext): Promise<IResponseWithPagination<IFileMulterGridfsInfo>>;
    remove(fileRemoveRequest: IFileRemoveRequest, options: IWithUserContext): Promise<number>;
}
