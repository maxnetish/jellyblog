import mongoose from 'mongoose';

let postSchema = new mongoose.Schema({
    // _id
    status: {
        type: String,
        enum: ['DRAFT', 'PUB'],
        default: 'DRAFT',
        required: true
    },
    createDate: {
        type: Date,
        required: true,
        default: () => new Date()
    },
    pubDate: {
        type: Date
    },
    updateDate: {
        type: Date,
        required: true,
        default: () => new Date()
    },
    author: {
        type: String,
        required: true
    },
    contentType: {
        type: String,
        enum: ['HTML', 'MD'],
        required: true,
        default: 'HTML'
    },
    title: {
        type: String,
        required: true,
        default: () => `At ${(new Date()).toLocaleString()}`
    },
    brief: {
        type: String,
        required: true,
        default: 'Short annotation of post content'
    },
    content: {
        type: String,
        required: true,
        default: 'Post content'
    },
    tags: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Tag'
        }
    ],
    titleImgUrl: {
        type: String
    }
});

export default mongoose.model('Post', postSchema);