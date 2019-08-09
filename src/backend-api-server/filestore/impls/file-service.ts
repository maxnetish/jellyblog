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
import {IFileServeRequest} from "../dto/file-serve-request";
import {Stream} from "stream";
import {GridFSBucket, GridFSBucketOptions, GridFSBucketReadStream} from "mongodb";
import {StreamRange} from "koa-stream";

@injectable()
export class FileService implements IFileService {

    @inject(TYPES.ModelFile)
    private FileModel: Model<IFileMulterGridFsDocument>;

    @inject(TYPES.ModelFileData)
    private FileDataModel: Model<any>;

    @inject(TYPES.PaginationUtils)
    private paginationUtils: IPaginationUtils;

    private buckets = new Map<any, GridFSBucket>();
    private getGridfsBucket(bucketName?: string): GridFSBucket {
        let bucket = this.buckets.get(bucketName);

        if(bucket) {
            return bucket;
        }

        bucket = new GridFSBucket(this.FileDataModel.collection.conn.db, {
            bucketName
        });
        this.buckets.set(bucketName, bucket);

        return bucket;
    }

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

    async getStatByName(criteria: IFileServeRequest): Promise<IFileMulterGridfsInfo | null> {
        const conditions: any = {
            filename: criteria.filename
        };
        const foundDoc = await this.FileModel
            .findOne(conditions)
            .lean(true)
            .exec();

        return foundDoc || null;
    }

    createStreamByName(criteria: IFileServeRequest, range?: StreamRange): Stream {
        const bucket = this.getGridfsBucket(criteria.bucket);
        const stream = bucket.openDownloadStreamByName(criteria.filename, range ? {
            revision: -1,
            start: range.start,
            end: range.end,
        }: undefined);
        return stream;
    }

}
