import Joi from '@hapi/joi';
import {IFileService} from "../api/file-service";
import {IFileFindCriteria} from "../dto/file-find-criteria";
import {IResponseWithPagination} from "../../utils/dto/response-with-pagination";
import {IFileMulterGridfsInfo} from "../dto/file-multer-gridfs-info";
import {IFileRemoveRequest} from "../dto/file-remove-request";
import {inject, injectable} from "inversify";
import {TYPES} from "../../ioc/types";
import {IWithUserContext} from "../../auth/dto/with-user-context";
import {Model, Types} from "mongoose";
import {IPaginationUtils} from "../../utils/api/pagination-utils";
import {IFileMulterGridFsDocument} from "../dto/file-multer-gridfs-document";

@injectable()
export class FileService implements IFileService {

    @inject(TYPES.ModelFile)
    private FileModel: Model<IFileMulterGridFsDocument>;

    @inject(TYPES.ModelFileData)
    private FileDataModel: Model<any>;

    @inject(TYPES.PaginationUtils)
    private paginationUtils: IPaginationUtils;

    async find(criteria: IFileFindCriteria, options: IWithUserContext): Promise<IResponseWithPagination<IFileMulterGridfsInfo>> {
        options.user.assertAuth([
            {role: ['admin']}
        ]);

        // build conditions
        const conditions: any = {};
        if (criteria.context) {
            conditions['metadata.context'] = criteria.context;
        }
        if (criteria.postId) {
            conditions['metadata.postId'] = new Types.ObjectId(criteria.postId);
        } else if (criteria.withoutPostId) {
            conditions['metadata.postId'] = null;
        }
        if (criteria.contentType) {
            conditions.contentType = {$regex: new RegExp(criteria.contentType, 'i')};
        }
        if (criteria.dateTo) {
            conditions.uploadDate = {$lte: criteria.dateTo};
        }
        if (criteria.dateFrom) {
            conditions.uploadDate = conditions.uploadDate || {};
            conditions.uploadDate.$gte = criteria.dateFrom;
        }

        // opts:
        const {skip, limit, page} = this.paginationUtils.skipLimitFromPaginationRequest(criteria);

        const foundDocs = await this.FileModel
            .find(conditions)
            .lean(false)
            .limit(limit + 1)
            .skip(skip)
            .sort('-uploadDate')
            .exec();

        return {
            itemsPerPage: limit,
            page,
            items: foundDocs.slice(0, limit),
            hasMore: foundDocs.length > limit,
        };
    }

    async remove(fileRemoveRequest: IFileRemoveRequest, options: IWithUserContext): Promise<number> {
        options.user.assertAuth([
            {role: ['admin']}
        ]);
        const ids = Array.isArray(fileRemoveRequest.id) ? fileRemoveRequest.id : [fileRemoveRequest.id];
        // remove both metadata and chunks
        const result = await Promise.all([
            this.FileModel.deleteMany({
                _id: {$in: ids}
            }),
            this.FileDataModel.deleteMany({
                files_id: {$in: ids}
            }),
        ]);
        return result[0].n || 0;
    }

}
