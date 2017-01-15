import mongoose from 'mongoose';
import fileStoreConfig from '../../config/file-store.json';
import path from 'path';

let FileSchema = new mongoose.Schema({
    filename: String
}, {
    strict: false
});

FileSchema.virtual('url').get(function (i) {
    return path.join(fileStoreConfig.gridFsBaseUrl, this.filename);
});

FileSchema.set('toObject', {virtuals: true});
FileSchema.set('toJSON', {virtuals: true});

export default mongoose.model('File', FileSchema, 'fs.files');