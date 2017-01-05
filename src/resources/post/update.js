import {Post, Tag} from '../../models';

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
        titleImgUrl: post.titleImgUrl
    };

    return updateTags(post.tags)
        .then(tagsIds => Post.findByIdAndUpdate(post._id, Object.assign(postData, {tags: tagsIds}), {
            'new': true,
            upsert: false,
            lean: true
        }).populate('tags', 'value'))
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