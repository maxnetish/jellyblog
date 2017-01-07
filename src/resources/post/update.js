import {Post, Tag, File, FileData} from '../../models';

function updateTags(tags) {
    tags = tags || [];

    let result = [];
    let promises = tags.map(t => Tag.findOne({value: t}, {}, {lean: true})
        .exec()
        .then(res => res || Tag.create({value: t}))
        .then(res => res._id)
    );

    return Promise.all(promises);
}

function updateAttachments(postId, newAttachments) {
    return Post.findById(postId, 'attachments', {
        lean: true
    })
        .then(post => {
            newAttachments = newAttachments || [];
            let currentAttachments = post.attachments || [];
            let removingAttachments = [];
            currentAttachments.forEach(currentAttachment => {
                if (newAttachments.indexOf(currentAttachment.toString()) === -1) {
                    removingAttachments.push(currentAttachment);
                }
            });
            if (removingAttachments.length) {
                let removePromises = [
                    File.remove({
                        _id: {$in: removingAttachments}
                    }).exec(),
                    FileData.remove({
                        files_id: {$in: removingAttachments}
                    }).exec()
                ];
                return Promise.all(removePromises);
            }
            return false;
        });
}

function updatePost(post) {
    if (!this.xhr) {
        // allow only rpc call
        reject(500);
        return;
    }
    if (!(this.req.user && this.req.user.role === 'admin')) {
        reject(401);
    }

    let postData = {
        updateDate: new Date(),
        author: this.req.user.userName,
        contentType: post.contentType,
        title: post.title,
        brief: post.brief,
        content: post.content,
        titleImgUrl: post.titleImgUrl,
        attachments: post.attachments // should be array of _id
    };

    return Promise.all([
        updateTags(post.tags),
        updateAttachments(post._id, post.attachments)
    ])
        .then(preResult => Post.findByIdAndUpdate(post._id, Object.assign(postData, {tags: preResult[0]}), {
            'new': true,
            upsert: false,
            lean: true
        })
            .populate('tags', 'value')
            .populate('attachments'))
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