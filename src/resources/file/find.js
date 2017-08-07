import {File} from '../../models';
import mongoose from 'mongoose';
import mongooseConfig from '../../../config/mongoose.json';
import toInteger from 'lodash/toInteger';

function find({context, postId, contentType, uploadDateMax, uploadDateMin, max = mongooseConfig.paginationDefaultLimit, skip = 0} = {}) {
    if (!this.xhr) {
        // allow only rpc call
        return Promise.reject(500);
    }
    if (!(this.req.user && this.req.user.role === 'admin')) {
        return Promise.reject(401);
    }

    let projection = '_id filename url contentType length uploadDate metadata';
    let opts = {
        // We souldn't use lean because of virtual property 'url'
        lean: false,
        limit: toInteger(max),
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

    return File.find(condition, projection, opts)
        .exec()
        .then(findResult => {
            return {
                items: findResult,
                hasMore: findResult.length >= opts.limit
            };
        });
}

export default find;