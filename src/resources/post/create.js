import {Post} from '../../models';

function createPost(post) {
    if (!this.xhr) {
        // allow only rpc call
        reject(500);
        return;
    }
    if (!(this.req.user && this.req.user.role === 'admin')) {
        reject(401);
    }

    let postData = Object.assign(post || {}, {
        author: this.req.user.userName
    });
    let newPost = new Post(postData);
    return newPost.save()
        .catch(err => {
            console.log(err);
            throw err;
        });
}

export default createPost;