import mongoose from 'mongoose';
import File from './file';
import urljoin from 'url-join';
import routesMap from '../../config/routes-map.json';

let postSchema = new mongoose.Schema({
    // _id
    status: {
        type: String,
        enum: ['DRAFT', 'PUB'],
        default: 'DRAFT',
        required: true
    },
    // TODO добавить соответсвующую поддержку в ресурсы и в форму создания/редактирования
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
            type: String,
            maxlength: 32
        }
    ],
    titleImg: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'File'
    },
    attachments: [
        {
            type: mongoose.Schema.Types.ObjectId,
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

// Add static methods
postSchema.static({
    createNewDefaultPost: function () {
        return {
            status: 'DRAFT',
            allowRead: 'FOR_ALL',
            contentType: 'MD',
            title: `At ${(new Date()).toLocaleString()}`,
            titleImg: null,
            tags: [],
            attachments: [],
            postBrief: '',
            content: '',
            hru: null
        }
    },
    /**
     * Adds all props explicitly to allow vue track changes
     * @param post
     * @returns {{}}
     */
    normalizeForBinding: function ({post = {}} = {}) {
        return {
            id: post.id || null,
            _id: post._id || null,
            status: post.status || null,
            createDate: post.createDate || null,
            pubDate: post.pubDate || null,
            updateDate: post.updateDate || null,
            author: post.author || null,
            contentType: post.contentType || 'HTML',
            title: post.title || null,
            brief: post.brief || null,
            content: post.content || null,
            tags: post.tags || [],
            titleImg: post.titleImg || null,
            attachments: post.attachments || [],
            hru: post.hru || null,
            allowRead: post.allowRead || 'FOR_ALL'
        };
    },
    /**
     * allowView: post can be view by user
     * allowUpdate: user can update post
     * @param post
     * @param user
     * @returns {{allowView: boolean, allowUpdate: boolean}}
     */
    mapPermissions: function ({post, user}) {
        let result = {
            allowView: false,
            allowUpdate: false
        };

        switch (post.allowRead) {
            case 'FOR_REGISTERED':
                result.allowView = !!(user && user.userName);
                break;
            case 'FOR_ME':
                result.allowView = user.userName === post.author;
                break;
            default:
                // FOR_ALL
                result.allowView = true;
                break;
        }

        // Only author can update
        result.allowUpdate = user && userName === post.author;

        return result;
    }
});

postSchema.virtual('url').get(function () {
    let urlId = this.hru || this._id;
    urlId = encodeURIComponent(urlId);
    return urljoin(routesMap.post, urlId);
});

// create text index
// See http://stackoverflow.com/questions/24714166/full-text-search-with-weight-in-mongoose
postSchema.index({title: 'text', brief: 'text', content: 'text'}, {
    name: 'My text index',
    weights: {title: 4, brief: 2, content: 1}
});

export default mongoose.model('Post', postSchema);