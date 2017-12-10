import {Post} from '../models';

/**
 *
 * @param post or postId required
 * @param user required
 * @param postId
 * @returns {*|Promise<any>}
 */
function check({post, user, postId}) {
    return Post.findById(postId || post._id, null, {lean: true})
        .exec()
        .then(existentPost => {
            if (!(existentPost && existentPost._id)) {
                // post not found
                return true;
            }
            let permissions = Post.mapPermissions({post: existentPost, user});
            return permissions.allowUpdate;
        });
}

export default check;