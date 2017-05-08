import mongoose from 'mongoose';

let mediaSrcsetSchema = new mongoose.Schema({
    // _id
    tag: {
        type: String,
        required: true,
        index: true
    },
    mediaQuery: {
        type: String
    },
    mediaFile: {
        type: mongoose.Schema.ObjectId,
        ref: 'File'
    },
    visible: {
        type: Boolean,
        default: true
    }
});

export default mongoose.model('MediaSrcset', mediaSrcsetSchema);