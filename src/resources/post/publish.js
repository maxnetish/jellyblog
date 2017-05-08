import {updatePostStatus, applyCheckPermissions} from '../../utils-data';

function publish({id = null, ids = []} = {}) {
    let postIds = ids;

    if (id) {
        postIds.push(id);
    }

    return updatePostStatus({ids: postIds, status: 'PUB'});
}

export default applyCheckPermissions({
    rpcCall: true,
    roles: ['admin'],
    resourceFn: publish
});