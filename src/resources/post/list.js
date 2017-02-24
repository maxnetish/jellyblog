import {Post} from '../../models';
import mongooseConfig from '../../../config/mongoose.json';


function fetch({q, page = 1, statuses = ['PUB']}={}) {
    let condition = {};
    let projection = '_id status createDate updateDate pubDate titleImg title brief';
    let opts = {
        lean: true,
        limit: mongooseConfig.paginationDefaultLimit + 1,
        sort: {createDate: 'desc'}
    };
    let allowDrafts = statuses.indexOf('DRAFT') > -1;

    if (!this.xhr && allowDrafts) {
        // allow only rpc call if qeury for drafts
        return Promise.reject(500);
    }

    if (!this.req.user && allowDrafts) {
        // allow only authirized user query for drafts
        return Promise.reject(401);
    }

    if (q) {
        // apply full text query
        Object.assign(condition, {
            $text: {
                $search: q,
                $caseSensitive: false,
                $diacriticSensitive: false
            }
        });
    }

    // apply statuses
    Object.assign(condition, {
        status: {
            $in: statuses
        }
    });

    if (allowDrafts) {
        // allow drafts only for its owner
        Object.assign(condition, {
            author: this.req.user.userName
        });
    }

    // set page
    page = parseInt(page, 10) || 1;
    opts.skip = (page - 1) * mongooseConfig.paginationDefaultLimit;

    return Post.find(condition, projection, opts)
        .populate('titleImg')
        .exec()
        .then(function (findResult) {
            findResult = findResult || [];
            let findedLen = findResult.length;
            if (findedLen > mongooseConfig.paginationDefaultLimit) {
                findResult.splice(mongooseConfig.paginationDefaultLimit, findedLen - mongooseConfig.paginationDefaultLimit);
            }
            return {
                items: findResult,
                hasMore: findedLen > mongooseConfig.paginationDefaultLimit
            };
        });
}

export default fetch;