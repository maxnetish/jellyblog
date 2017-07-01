import {Post, File, FileData} from '../../models';
import {applyCheckPermissions} from '../../utils-data';

function remove({id = null, ids = []} = {}) {
    let postIds = ids;

    if (id) {
        postIds.push(id);
    }

    if (!postIds.length) {
        throw new Error(400);
    }

    return Promise.all(postIds.map(postId => {
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
    }))
        .then(result => {
            return postIds;
        });
}

export default applyCheckPermissions({
    rpcCall: true,
    roles: ['admin'],
    resourceFn: remove
});