import {model, Schema} from 'mongoose';

const FileDataSchema = new Schema({}, {
    strict: false
});

// We shouldn't use file chunks directly, so use any
export const FileDataModel = model<any>('FileData', FileDataSchema, 'fs.chunks');
