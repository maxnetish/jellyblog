import {updatePostStatus, applyCheckPermissions, canUpdatePost} from '../../utils-data';
import {filter} from 'lodash';

function publish({id = null, ids = []} = {}) {
    const postIds = ids;
    const self = this;

    if (id) {
        postIds.push(id);
    }

    const checkPromises = postIds.map(postId => canUpdatePost({postId, user: self.user}));

    return Promise.all(checkPromises)
        .then(checkResults => {
            const postThatWillUpdate = filter(postIds, (postId, ind) => checkResults[ind]);
            return updatePostStatus({ids: postThatWillUpdate, status: 'PUB'});
        });
}

export default applyCheckPermissions({
    rpcCall: true,
    roles: ['admin'],
    resourceFn: publish
});