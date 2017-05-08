import mongoose from 'mongoose';
import fileStoreConfig from '../../config/file-store.json';
import urljoin from 'url-join';

let FileSchema = new mongoose.Schema({
    filename: String
}, {
    strict: false
});

FileSchema.virtual('url').get(function (i) {
    return urljoin(fileStoreConfig.gridFsBaseUrl, this.filename);
});

FileSchema.set('toObject', {virtuals: true});
FileSchema.set('toJSON', {virtuals: true});

export default mongoose.model('File', FileSchema, 'fs.files');