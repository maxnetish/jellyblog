import {Post, File, FileData} from '../../models';
import {applyCheckPermissions} from '../../utils-data';

function remove({id = null} = {}) {

    if (!id) {
        throw new Error(400);
    }

    return Post.findByIdAndRemove(id)
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
        })
        .then(res => {
            return {};
        });
}

export default applyCheckPermissions({
    rpcCall: true,
    roles: ['admin'],
    resourceFn: remove
});