import {Post} from '../../models';
import mongooseConfig from '../../../config/mongoose.json';


function fetch({token, statuses = ['PUB']} = {}) {

    let allowDrafts = statuses.indexOf('DRAFT') > -1;

    if (!this.xhr && allowDrafts) {
        // allow only rpc call if qeury for drafts
        return Promise.reject(500);
    }

    if (!this.req.user && allowDrafts) {
        // allow only authirized user query for drafts
        return Promise.reject(401);
    }

    let mapReduceOptions = {
        query: {
            status: {
                $in: statuses
            }
        },
        map: function () {
            if (this.tags) {
                this.tags.forEach(t => emit(t, 1));
            }
        },
        reduce: function (key, values) {
            return values.reduce((acc, val) => {
                return acc + val;
            });
        }
    };

    return Post.mapReduce(mapReduceOptions)
        .then(reduceResult => reduceResult.map(item => ({tag: item._id, count: item.value})));

    /*
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
     */
}

export default fetch;