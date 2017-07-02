import {Post} from '../../models';
import {applyCheckPermissions} from '../../utils-data';
import isArray from 'lodash/isArray';

function func({id=null, ids=[]} = {}) {
    let postIds = ids;
    if(id) {
        ids.push(id);
    }
    let condition = {
        _id: {
            $in: postIds
        }
    };
    let opts = {
        lean: false
    };

    return Post.find(condition, null, opts)
        .populate('attachments')
        .populate('titleImg')
        .exec();
}

export default applyCheckPermissions({
    rpcCall: true,
    roles: ['admin'],
    resourceFn: func
});