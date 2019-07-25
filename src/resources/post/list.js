import {Post} from '../../models';
import mongooseConfig from '../../../config/mongoose.json';
import {applyCheckPermissions} from "../../utils-data";

/**
 * Returns list of posts for admin page
 * @param from
 * @param to
 * @param q
 * @param page - request specified page
 * @param pages - request pages from 1 to pages
 * @param statuses
 * @param {string[]} ids
 * @returns {*|Promise<any>}
 */
function fetch({from, to, q, page = 1, pages, statuses = ['PUB'], ids} = {}) {
    let condition = {};
    let projection = '_id status createDate updateDate pubDate titleImg title brief';
    let opts = {
        lean: true,
        sort: {createDate: 'desc'}
    };
    let allowDrafts = statuses.indexOf('DRAFT') > -1;
    let sanitizedFrom = from ? new Date(from) : null;
    let sanitizedTo = to ? new Date(to) : null;
    let sanitizedQ = q ? q.substring(0, 64) : null;
    let createDateCondition;

    // not set page and limit if request for specific docs
    let numberOfDocsAtuallyNeeded;
    if(!(ids && ids.length)) {
        // we try to find 1 more doc to see if we have some more docs after requested
        if (pages) {
            // if set pages - returns all pages from 1 to pages
            pages = parseInt(pages, 10) || 1;
            numberOfDocsAtuallyNeeded = mongooseConfig.paginationDefaultLimit * pages;
            opts.skip = 0;
            opts.limit = numberOfDocsAtuallyNeeded + 1;
        } else {
            // else return page, specified by paramater page
            page = parseInt(page, 10) || 1;
            numberOfDocsAtuallyNeeded = mongooseConfig.pag
            inationDefaultLimit;
            opts.skip = (page - 1) * mongooseConfig.paginationDefaultLimit;
            opts.limit = numberOfDocsAtuallyNeeded + 1;
        }
    }

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

    if (ids && ids.length) {
        Object.assign(condition, {
            _id: {
                $in: ids
            }
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
        author: this.user.userName
    });

    return Post.find(condition, projection, opts)
        .populate('titleImg')
        .exec()
        .then(function (findResult) {
            findResult = findResult || [];
            const foundLen = findResult.length;
            if (numberOfDocsAtuallyNeeded && foundLen > numberOfDocsAtuallyNeeded) {
                // cut 'one more' doc
                // not cut docs if request for specific ids
                findResult.splice(numberOfDocsAtuallyNeeded, foundLen - numberOfDocsAtuallyNeeded);
            }
            return {
                items: findResult,
                hasMore: foundLen > numberOfDocsAtuallyNeeded
            };
        });
}

export default applyCheckPermissions({
    rpcCall: true,
    roles: ['admin'],
    resourceFn: fetch
});
