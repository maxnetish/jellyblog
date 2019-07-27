import {model, Schema} from "mongoose";
import {IPostAllDetailsPopulatedDocument} from "../dto/post-all-details-populated-document";

const postBasePath = process.env.JB_POST_BASEURL || '/post';

const schema = new Schema({
    // _id
    status: {
        type: String,
        enum: ['DRAFT', 'PUB'],
        default: 'DRAFT',
        required: true
    },
    allowRead: {
        type: String,
        enum: ['FOR_ALL', 'FOR_REGISTERED', 'FOR_ME'],
        default: 'FOR_ALL',
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
        required: false,
        default: null,
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
            type: String,
            maxlength: 32
        }
    ],
    titleImg: {
        type: Schema.Types.ObjectId,
        ref: 'File'
    },
    attachments: [
        {
            type: Schema.Types.ObjectId,
            ref: 'File'
        }
    ],
    hru: {
        type: String,
        required: false,
        index: true,
        unique: false,
        maxlength: 64
    }
});

schema.virtual('url')
    .get(function (this: IPostAllDetailsPopulatedDocument) {
        let urlId = this.hru || this._id;
        urlId = encodeURIComponent(urlId);
        return `${postBasePath}/${urlId}`;
    });

// create text index
// See http://stackoverflow.com/questions/24714166/full-text-search-with-weight-in-mongoose
schema.index({title: 'text', brief: 'text', content: 'text'}, {
    name: 'My text index',
    weights: {title: 4, brief: 2, content: 1}
});

export const PostModel = model<IPostAllDetailsPopulatedDocument>('Post', schema);
