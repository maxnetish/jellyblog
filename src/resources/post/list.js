import {Post} from '../../models';
import mongooseConfig from '../../../config/mongoose.json';
import {applyCheckPermissions} from "../../utils-data";

/**
 * Returns list of posts for admin page
 * @param from
 * @param to
 * @param q
 * @param page
 * @param statuses
 * @returns {*|Promise<any>}
 */
function fetch({from, to, q, page = 1, statuses = ['PUB']} = {}) {
    let condition = {};
    let projection = '_id status createDate updateDate pubDate titleImg title brief';
    let opts = {
        lean: true,
        limit: mongooseConfig.paginationDefaultLimit + 1,
        sort: {createDate: 'desc'}
    };
    let allowDrafts = statuses.indexOf('DRAFT') > -1;
    let sanitizedFrom = from ? new Date(from) : null;
    let sanitizedTo = to ? new Date(to) : null;
    let sanitizedQ = q ? q.substring(0, 64) : null;
    let createDateCondition;

    if (sanitizedQ) {
        // apply full text query
        Object.assign(condition, {
            $text: {
                $search: sanitizedQ,
                $caseSensitive: false,
                $diacriticSensitive: false
            }
        });
    }

    if (sanitizedFrom) {
        createDateCondition = Object.assign(createDateCondition || {}, {
            $gte: sanitizedFrom
        });
    }

    if (sanitizedTo) {
        createDateCondition = Object.assign(createDateCondition || {}, {
            $lte: sanitizedTo
        });
    }

    if (createDateCondition) {
        Object.assign(condition, {
            createDate: createDateCondition
        });
    }

    // apply statuses
    Object.assign(condition, {
        status: {
            $in: statuses
        }
    });

    // list only posts of current user
    Object.assign(condition, {
        author: this.req.user.userName
    });

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

export default applyCheckPermissions({
    rpcCall: true,
    roles: ['admin'],
    resourceFn: fetch
});