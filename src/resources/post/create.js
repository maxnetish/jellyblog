import {Post} from '../../models';
import {updateTags} from '../../utils-data';
import {applyCheckPermissions} from '../../utils-data';

function createPost(post) {
    post = post || {};

    return updateTags(post.tags)
        .then(tagIds => {
            let postData = Object.assign(post || {}, {
                author: this.req.user.userName,
                tags: tagIds
            });
            let newPost = new Post(postData);
            return newPost.save();
        })
        .catch(err => {
            console.log(err);
            throw err;
        });


}

export default applyCheckPermissions({
    rpcCall: true,
    roles: ['admin'],
    resourceFn: createPost
});