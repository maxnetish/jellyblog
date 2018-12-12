import {Post} from '../../models';
import {applyCheckPermissions} from '../../utils-data';
import isArray from 'lodash/isArray';

function func({posts = []}) {

    let mapped = [];

    posts = isArray(posts) ? posts : [posts];

    mapped = posts.map(p => {
        return Object.assign(p, {
            author: this.user.userName
        });
    });

    return Post.insertMany(mapped);
}

export default applyCheckPermissions({
    rpcCall: true,
    roles: ['admin'],
    resourceFn: func
});