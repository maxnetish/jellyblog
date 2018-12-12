import {updatePostStatus, applyCheckPermissions, canUpdatePost} from '../../utils-data';
import {filter} from "lodash";

function unpublish({id = null, ids = []} = {}) {
    let self = this;
    let postIds = ids;

    if (id) {
        postIds.push(id);
    }

    const checkPromises = postIds.map(postId => canUpdatePost({postId, user: self.user}));

    return Promise.all(checkPromises)
        .then(checkResults => {
            let postThatWillUpdate = filter(postIds, (postId, ind) => checkResults[ind]);
            return updatePostStatus({ids: postThatWillUpdate, status: 'DRAFT'});
        });
}

export default applyCheckPermissions({
    rpcCall: true,
    roles: ['admin'],
    resourceFn: unpublish
});