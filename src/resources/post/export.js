import {Post} from '../../models';
import {applyCheckPermissions} from '../../utils-data';
import isArray from 'lodash/isArray';

function func(postOrPosts) {

    let mapped = [];

    postOrPosts = isArray(postOrPosts) ? postOrPosts : [postOrPosts];

    mapped = postOrPosts.map(p => {
        return Object.assign(p, {
            author: this.req.user.userName
        });
    });

    return Post.create(mapped);
}

export default applyCheckPermissions({
    rpcCall: true,
    roles: ['admin'],
    resourceFn: func
});