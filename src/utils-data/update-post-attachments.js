import {Post, File, FileData} from '../models';

/**
 * Receives _id of post and array of attached files (_id`s). Removes attachments from store
 * that is not attached with post
 * @param postId
 * @param newAttachments
 * @returns {Request|Promise|Promise.<TResult>|*}
 */
export default function updateAttachments(postId, newAttachments) {
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