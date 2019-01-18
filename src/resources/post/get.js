import {Post} from '../../models';


function fetch({id} = {}) {
    const self = this;
    const opts = {
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
            const postPermissions = Post.mapPermissions({post: res, user: self.user});
            if(!postPermissions.allowView) {
                return Promise.reject({status: 401});
            }
            return Post.normalizeForBinding({post: res});
        });
}

export default fetch;
