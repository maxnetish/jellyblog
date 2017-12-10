import {Post, File, FileData} from '../../models';
import {applyCheckPermissions, canUpdatePost} from '../../utils-data';
import isArray from 'lodash/isArray';
import {filter} from "lodash";

function remove({id = null, ids = []} = {}) {
    let self = this;
    let postIds = isArray(ids) ? ids : [ids];
    let postIdsThatWillActuallyRemove;

    if (id) {
        postIds.push(id);
    }

    if (!postIds.length) {
        throw new Error(400);
    }

    let checkPromises = postIds.map(postId => canUpdatePost({postId, user: self.req.user}));

    return Promise.all(checkPromises)
        .then(checkResults => {
            postIdsThatWillActuallyRemove = filter(postIds, (postId, ind) => checkResults[ind]);
            return Promise.all(postIdsThatWillActuallyRemove.map(postId => {
                return Post.findByIdAndRemove(postId)
                    .exec()
                    .then(removedPost => {
                        removedPost = removedPost || {};
                        let removingAttachments = removedPost.attachments || [];
                        return Promise.all([
                            File.remove({
                                _id: {$in: removingAttachments}
                            }).exec(),
                            FileData.remove({
                                files_id: {$in: removingAttachments}
                            }).exec()
                        ]);
                    });
            }));
        })
        .then(results => postIdsThatWillActuallyRemove);
}

export default applyCheckPermissions({
    rpcCall: true,
    roles: ['admin'],
    resourceFn: remove
});