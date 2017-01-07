import {Post} from '../../models';
import mongooseConfig from '../../../config/mongoose.json';


function fetch({id, urlId}={}) {
    // let condition = {};
    // let projection = '_id status updateDate title brief';
    let opts = {
        lean: true
    };

    // if (maxId) {
    //     Object.assign(condition, {
    //         _id: {
    //             $lt: maxId
    //         }
    //     });
    // }

    return Post.findById(id, null, opts)
        .populate('tags', 'value')
        .populate('attachments')
        .exec()
        .then(res => {
            if (res && res.tags) {
                res.tags = res.tags.map(tagWrapped => tagWrapped.value);
            }
            return res;
        });
}

export default fetch;