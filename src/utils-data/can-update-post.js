import {Post} from '../models';

/**
 *
 * @param post or postId required
 * @param user required
 * @param postId
 * @returns {*|Promise<any>}
 */
async function check({post, user, postId}) {
    const existentPost = await Post.findById(postId || post._id, null, {lean: true}).exec();
    if (!(existentPost && existentPost._id)) {
        // post not found
        return true;
    }
    const permissions = Post.mapPermissions({post: existentPost, user});
    return permissions.allowUpdate;
}

export default check;