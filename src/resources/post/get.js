import {Post} from '../../models';


function fetch({id} = {}) {
    let self = this;
    let opts = {
        lean: false
    };

    if (!id) {
        return Post.createNewDefaultPost();
    }

    return Post.findById(id, null, opts)
        .populate('attachments')
        .populate('titleImg')
        .exec()
        .then(res => {
            let postPermissions = Post.mapPermissions({post: res, user: self.req && self.req.user});
            if(!postPermissions.allowView) {
                return Promise.reject(401);
            }
            return Post.normalizeForBinding({post: res});
        });
}

export default fetch;