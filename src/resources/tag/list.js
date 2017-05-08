import {Tag} from '../../models';
import mongooseConfig from '../../../config/mongoose.json';


function fetch({token, max, skip}={}) {
    let condition = {};
    let projection = '_id value';
    let opts = {
        lean: true,
        limit: max,
        skip: skip,
        sort: 'value'
    };

    if (token) {
        Object.assign(condition, {
            value: {
                $regex: new RegExp(token, 'i')
            }
        });
    }

    return Tag.find(condition, projection, opts)
        .exec()
        .then(function (findResult) {
            return {
                items: findResult,
                hasMore: findResult.length >= opts.limit
            };
        });
}

export default fetch;