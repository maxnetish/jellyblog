import {IFileService} from "../../api/file-service";
import {IFileServeRequest} from "../../dto/file-serve-request";
import {StreamRange} from "koa-stream";
import {Stream} from "stream";
import {IFileFindCriteria} from "../../dto/file-find-criteria";
import {IWithUserContext} from "../../../auth/dto/with-user-context";
import {IResponseWithPagination} from "../../../utils/dto/response-with-pagination";
import {IFileMulterGridfsInfo} from "../../dto/file-multer-gridfs-info";
import {IFileRemoveRequest} from "../../dto/file-remove-request";
import {StreamFromString} from "../../../test/utils";
import {injectable} from "inversify";

export const existingFileName = '2c096d610ea47430e738238be7135f00';
export const unexistingFileName = '2c096d610ea47430e738238be7135000';

@injectable()
export class FileServiceMock implements IFileService {

    createStreamByName(criteria: IFileServeRequest, range?: StreamRange): Promise<Stream> | Stream {
        if(criteria.filename!==existingFileName) {
            throw('FileNotFound');
        }
        const stream = new StreamFromString('0123456789');
        return stream;
    }

    find(criteria: IFileFindCriteria, options: IWithUserContext): Promise<IResponseWithPagination<IFileMulterGridfsInfo>> {
        throw('Not implemented');
    }

    async getStatByName(criteria: IFileServeRequest): Promise<IFileMulterGridfsInfo | null> {
        if(criteria.filename !== existingFileName) {
            return null;
        }

        return {
            length: 10,
            contentType: 'application/octet-stream',
            md5: '2c096d61',
            originalname: 'test.txt',
            bucketName: 'fs',
            chunkSize: 128,
            encoding: '',
            filename: existingFileName,
            metadata: {
                context: ''
            },
            mimetype: 'application/octet-stream',
            id: '',
            path: '',
            size: 10,
            uploadDate: new Date(),
            url: '',
            fieldname: '',
            destination: '',
            buffer: Buffer.from([]),
            location: '',
        };
    }

    remove(fileRemoveRequest: IFileRemoveRequest, options: IWithUserContext): Promise<number> {
        throw ('Not implemented');
    }

}
