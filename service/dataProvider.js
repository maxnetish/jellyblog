/**
 * Created by Gordeev on 13.06.2014.
 */

var model = require('../models').model,
    _ = require('underscore');

var promisePostRemove = function (id) {
    return model.Post.findByIdAndRemove(id);
}

var promisePostUpdate = function (post) {
    var query;

    query = model.Post.findByIdAndUpdate(post._id, post);
    return query.exec();
};

var promisePostCreate = function (post) {
    var promise;

    // some post validation?

    promise = model.Post.create(post);
    return promise;
};

var promisePostGetById = function (id) {
    var query = model.Post.findById(id);
    return query.exec();
};

var promisePostGetBySlug = function (slug) {
    var query, condition;
    slug = slug || "";

    condition = {
        slug: slug
    };

    query = model.Post.findOne(condition);
    return query.exec();
};

var promisePostsList = function (queryParams) {
    var query,
        condition = {},
        fromDate,
        fields = 'id title slug featured draft date';

    queryParams = queryParams || {};

    if (queryParams.fromDate) {
        if (_.isDate(queryParams.fromDate)) {
            fromDate = queryParams.fromDate;
        } else if (_.isString(queryParams.fromDate)) {
            fromDate = Date.parse(queryParams.fromDate);
        } else if (_.isNumber(queryParams.fromDate)) {
            fromDate = new Date(queryParams.fromDate);
        }
    }

    if (fromDate) {
        condition.date = {
            $gt: fromDate
        };
    }

    if (!queryParams.uncludeDraft) {
        condition.draft = true
    }

    query = model.Post.find(condition, fields);

    if (queryParams.limit) {
        if (_.isNumber(queryParams.limit)) {
            query = query.limit(queryParams.limit);
        } else {
            query = query.limit(parseInt(queryParams.limit, 10));
        }
    }

    return query.exec();
};

module.exports = {
    promisePostsList: promisePostsList,
    promisePostGetBySlug: promisePostGetBySlug,
    promisePostGetById: promisePostGetById,
    promisePostCreate: promisePostCreate,
    promisePostUpdate: promisePostUpdate,
    promisePostRemove: promisePostRemove
};