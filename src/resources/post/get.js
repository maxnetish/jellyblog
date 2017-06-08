import {Post} from '../../models';
import mongooseConfig from '../../../config/mongoose.json';


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

            if (res && res.status !== 'PUB' && !self.xhr) {
                // allow draft only throw rpc call
                return Promise.reject(401);
            }

            if (res && res.status !== 'PUB' && self.req.user.userName !== res.author) {
                // allow draft only for it owner
                return Promise.reject(401);
            }

            return res;
        });
}

export default fetch;