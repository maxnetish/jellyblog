import mongoose from 'mongoose';

let FileDataSchema = new mongoose.Schema({}, {
    strict: false
});

export default mongoose.model('FileData', FileDataSchema, 'fs.chunks');