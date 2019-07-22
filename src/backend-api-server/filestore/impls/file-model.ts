import {model, Schema} from "mongoose";
import {IFileMulterGridFsDocument} from "../dto/file-multer-gridfs-document";

let gridFsBseUrl = process.env.JB_GRIDFS_BASEURL || '/file';
gridFsBseUrl = gridFsBseUrl.endsWith('/') ? gridFsBseUrl : gridFsBseUrl + '/';

const FileSchema = new Schema({
    filename: String
}, {
    strict: false
});

FileSchema.virtual('url').get(function (this: IFileMulterGridFsDocument) {
    return gridFsBseUrl + this.filename;
});

FileSchema.set('toObject', {
    virtuals: true,
});
FileSchema.set('toJSON', {
    virtuals: true,
});

export const FileModel = model<IFileMulterGridFsDocument>('File', FileSchema, 'fs.files');
