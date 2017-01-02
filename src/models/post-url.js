import mongoose from 'mongoose';

let postUrlSchema = new mongoose.Schema({
    // _id
    url: {
        type: String,
        required: true,
        index: true,
        unique: true
    },
    post: {
        type: mongoose.Schema.ObjectId,
        ref: 'Post'
    }
});

export default mongoose.model('PostUrl', postUrlSchema);