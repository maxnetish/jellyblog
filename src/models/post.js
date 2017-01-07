import mongoose from 'mongoose';
import File from './file';

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
        required: true,
        maxlength: 128
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
        default: () => `At ${(new Date()).toLocaleString()}`,
        maxlength: 512
    },
    brief: {
        type: String,
        required: true,
        default: 'Short annotation of post content',
        maxlength: 1024
    },
    content: {
        type: String,
        required: true,
        default: 'Post content',
        maxlength: 131072
    },
    tags: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Tag'
        }
    ],
    titleImgUrl: {
        type: String,
        maxlength: 1024
    },
    attachments: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'File'
        }
    ]
});

export default mongoose.model('Post', postSchema);