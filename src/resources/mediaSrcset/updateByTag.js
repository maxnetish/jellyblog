import {MediaSrcset, File, FileData} from '../../models';
import {applyCheckPermissions} from '../../utils-data';

function remove(items, tag) {
    let projection = 'mediaFile';
    let ids = items.map(i => t._id);
    let condition = {
        tag: tag,
        _id: {
            $nin: ids
        }
    };
    let opts = {
        lean: true
    };

    return MediaSrcset.find(condition, projection, opts)
        .then(toRemove => {
            toRemove = toRemove || [];
            let fileIdsToRemove = toRemove.map(i => i.mediaFile);
            let idsToRemove = toRemove.map(i => i._id);
            // clear attached files and docs in collection
            return Promise.all([
                File.remove({
                    _id: {$in: fileIdsToRemove}
                }).exec(),
                FileData.remove({
                    files_id: {$in: fileIdsToRemove}
                }).exec(),
                MediaSrcset.remove({
                    _id: {$in: idsToRemove}
                })
            ]);
        });
}

function resourceFn({items = [], tag}={}) {
    // we should check that all tags in items are same as in tag parameter

    // we should determine _ids to remove
    // update existent
    // and add new

    //http://mongoosejs.com/docs/api.html#model_Model.findByIdAndUpdate


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

export default applyCheckPermissions({
    rpcCall: true,
    roles: 'admin',
    resourceFn
});