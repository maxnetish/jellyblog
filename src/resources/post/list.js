import {Post} from '../../models';
import mongooseConfig from '../../../config/mongoose.json';


function fetch({maxId}={}) {
    let condition = {};
    let projection = '_id status updateDate title brief';
    let opts = {
        lean: true,
        limit: mongooseConfig.paginationDefaultLimit
    };

    if (maxId) {
        Object.assign(condition, {
            _id: {
                $lt: maxId
            }
        });
    }

    return Post.find(condition, projection, opts)
        .exec()
        .then(function (findResult) {
            return {
                items: findResult,
                hasMore: findResult.length >= opts.limit
            };
        });
}

export default fetch;