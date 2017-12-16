import {updatePostStatus, applyCheckPermissions, canUpdatePost} from '../../utils-data';
import {filter} from 'lodash';

function publish({id = null, ids = []} = {}) {
    let postIds = ids;
    let self = this;

    if (id) {
        postIds.push(id);
    }

    let checkPromises = postIds.map(postId => canUpdatePost({postId, user: self.req.user}));

    return Promise.all(checkPromises)
        .then(checkResults => {
            let postThatWillUpdate = filter(postIds, (postId, ind) => checkResults[ind]);
            return updatePostStatus({ids: postThatWillUpdate, status: 'PUB'});
        });
}

export default applyCheckPermissions({
    rpcCall: true,
    roles: ['admin'],
    resourceFn: publish
});