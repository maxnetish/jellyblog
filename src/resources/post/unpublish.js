import {updatePostStatus, applyCheckPermissions} from '../../utils-data';

function unpublish({id = null, ids = []} = {}) {
    let postIds = ids;

    if (id) {
        postIds.push(id);
    }

    return updatePostStatus({ids: postIds, status: 'DRAFT'});
}

export default applyCheckPermissions({
    rpcCall: true,
    roles: ['admin'],
    resourceFn: unpublish
});