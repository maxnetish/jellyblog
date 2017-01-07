import mongoose from 'mongoose';

let FileSchema = new mongoose.Schema({}, {
    strict: false
});

export default mongoose.model('File', FileSchema, 'fs.files');