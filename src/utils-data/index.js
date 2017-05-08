import updateTags from './update-tags';
import updatePostAttachments from './update-post-attachments';
import updatePostStatus from './update-posts-status';
import applyCheckPermissions from './apply-check-permissions';
import {addEntryFromMorgan, addEntryFromErrorResponse} from './log-to-mongo';

export {
    updateTags,
    updatePostAttachments,
    updatePostStatus,
    applyCheckPermissions,
    addEntryFromMorgan,
    addEntryFromErrorResponse
};