import {File} from '../../models';
import mongoose from 'mongoose';
import mongooseConfig from '../../../config/mongoose.json';
import toInteger from 'lodash/toInteger';
import {applyCheckPermissions} from '../../utils-data';

/**
 *
 * @param context
 * @param postId
 * @param contentType
 * @param uploadDateMax
 * @param uploadDateMin
 * @param max
 * @param skip ignore if page setted
 * @param page
 */
function find({context, postId, contentType, uploadDateMax, uploadDateMin, max = mongooseConfig.paginationDefaultLimit, skip = 0, page} = {}) {
    let projection = '_id filename url contentType length uploadDate metadata';
    max = toInteger(max);
    let opts = {
        // We souldn't use lean because of virtual property 'url'
        lean: false,
        limit: max + 1,
        skip: toInteger(skip),
        sort: '-uploadDate'
    };
    let condition = {};

    if (context) {
        Object.assign(condition, {
            'metadata.context': context
        });
    }

    if (postId) {
        Object.assign(condition, {
            'metadata.postId': new mongoose.mongo.ObjectId(postId)
        });
    }

    if (contentType) {
        Object.assign(condition, {
            contentType: {$regex: new RegExp(contentType, 'i')}
        });
    }

    if (uploadDateMax) {
        condition.uploadDate = condition.uploadDate || {};
        Object.assign(condition.uploadDate, {
            $lte: uploadDateMax
        });
    }

    if (uploadDateMin) {
        condition.uploadDate = condition.uploadDate || {};
        Object.assign(condition.uploadDate, {
            $gte: uploadDateMin
        });
    }

    // set page
    // ignore skip if page setted
    if (page) {
        opts.skip = (page - 1) * mongooseConfig.paginationDefaultLimit;
    }

    return File.find(condition, projection, opts)
        .exec()
        .then(findResult => {
            findResult = findResult || [];
            let findedLen = findResult.length;
            if (findedLen > max) {
                findResult.splice(max, findedLen - max);
            }
            return {
                items: findResult,
                hasMore: findedLen > max
            };
        });
}

export default applyCheckPermissions({
    rpcCall: true,
    roles: ['admin'],
    resourceFn: find
});