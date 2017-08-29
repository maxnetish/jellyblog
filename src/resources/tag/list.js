import {Post} from '../../models';
import routesMap from '../../../config/routes-map.json';
import urljoin from 'url-join';

function fetch({statuses = ['PUB']} = {}) {

    let allowDrafts = statuses.indexOf('DRAFT') > -1;

    if (allowDrafts && !this.xhr) {
        // allow only rpc call if qeury for drafts
        return Promise.reject(500);
    }

    if (allowDrafts && !this.req.user) {
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
                this.tags.forEach(function (t) {
                    return emit(t, 1);
                });
            }
        },
        reduce: function (key, values) {
            return values.reduce(function (acc, val) {
                return acc + val;
            });
        }
    };

    return Post.mapReduce(mapReduceOptions)
        .then(reduceResult => {
            let mappedResult = reduceResult.map(item => ({
                tag: item._id,
                count: item.value,
                url: urljoin(routesMap.tag, encodeURIComponent(item._id))
            }));
            let sortedResult = mappedResult.sort((a, b) => b.count - a.count);
            return sortedResult;
        });

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