/**
 * DEPRECATED
 */
import {Post, Tag, File, FileData} from '../../models';
import {updateTags, updatePostAttachments} from '../../utils-data';

function updatePost(post) {
    if (!this.xhr) {
        // allow only rpc call
        return Promise.reject(500);
    }
    if (!(this.req.user && this.req.user.role === 'admin')) {
        return Promise.reject(401);
    }

    let postData = {
        updateDate: new Date(),
        author: this.req.user.userName,
        contentType: post.contentType,
        title: post.title,
        brief: post.brief,
        content: post.content,
        titleImg: post.titleImg,        // should be _id
        attachments: post.attachments,  // should be array of _id
        tags: post.tags,                 // should be array of strings
        pubDate: post.pubDate
    };

    return Promise
        .all([
            updateTags(postData.tags),
            updatePostAttachments(post._id, postData.attachments)
        ])
        .then(preResult => Post
            .findByIdAndUpdate(post._id, Object.assign(postData, {tags: preResult[0]}), {
                'new': true,
                upsert: false,
                lean: false
            })
            .populate('tags')
            .populate('attachments')
            .populate('titleImg'))
        .then(res => {
            if (res && res.tags) {
                res.tags = res.tags.map(tagWrapped => tagWrapped.value);
            }
            return res;
        })
        .catch(err => {
            console.log(err);
            throw err;
        });

}

export default updatePost;