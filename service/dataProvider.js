/**
 * Created by Gordeev on 13.06.2014.
 */

var model = require('../models').model,
    _ = require('underscore');

var sanitizeDate = function (row) {
    var result;

    if (row) {
        if (_.isDate(row)) {
            result = row;
        } else if (_.isString(row)) {
            result = Date.parse(row);
        } else if (_.isNumber(row)) {
            result = new Date(row);
        }
    }

    return result;
};

var sanitizeBoolean = function (row) {
    var result = false;

    if (_.isNull(row) || _.isUndefined(row)) {
        return null;
    }

    if (row == 'on' || row == 'true') {
        result = true;
    }
    else if (row) {
        try {
            result = new Boolean(parseInt(row)).valueOf();
        } catch (err) {
        }
    }
    return result;
}

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
        aggregate,
        condition = {},
        fromDate,
        toDate,
        tag,
        search,
        limit,
        featured,
        includeDraft;

    queryParams = queryParams || {};

    fromDate = sanitizeDate(queryParams.fromDate);
    toDate = sanitizeDate(queryParams.toDate);
    tag = queryParams.tag;
    search = queryParams.search;
    featured = sanitizeBoolean(queryParams.featured);
    includeDraft = sanitizeBoolean(queryParams.includeDraft);
    limit = parseInt(queryParams.limit, 10);

    if (fromDate || toDate) {
        condition.date = {};
    }
    if (fromDate) {
        condition.date.$gte = fromDate;
    }
    if (toDate) {
        condition.date.$lte = toDate;
    }
    if (tag) {
        condition.tag = tag;
    }
    if (search) {
        condition.content = /search/;
    }
    if (_.isBoolean(featured)) {
        condition.featured = featured;
    }
    if (!includeDraft) {
        condition.draft = false;
    }

    aggregate = model.Post.aggregate({
            $match: condition
        }, {
            $project: {
                title: 1,
                slug: 1,
                featured: 1,
                draft: 1,
                date: 1
            }
        }
    );

    if (fromDate && limit) {
        //reverse req:
        aggregate = aggregate
            .sort('date')
            .limit(limit)
            .sort('-date');
    } else {
        aggregate = aggregate
            .sort('-date');
        if (limit) {
            aggregate = aggregate
                .limit(limit);
        }
    }

    return aggregate.exec();

    /*
     queryParams = queryParams || {};

     fromDate = sanitizeDate(queryParams.fromDate);
     toDate = sanitizeDate(queryParams.toDate);

     if (fromDate || toDate) {
     condition.date = {};
     }
     if (fromDate) {
     condition.date.$gt = fromDate;
     }
     if (toDate) {
     condition.date.$lte = toDate;
     }

     if (!queryParams.includeDraft) {
     condition.draft = true;
     }

     query = model.Post.find(condition, fields);

     if (toDate && !fromDate && queryParams.limit) {
     query = query.sort('date');
     }

     if (queryParams.limit) {
     if (_.isNumber(queryParams.limit)) {
     query = query.limit(queryParams.limit);
     } else {
     query = query.limit(parseInt(queryParams.limit, 10));
     }
     }

     query = query.sort('-date')

     return query.exec();
     */
};

module.exports = {
    promisePostsList: promisePostsList,
    promisePostGetBySlug: promisePostGetBySlug,
    promisePostGetById: promisePostGetById,
    promisePostCreate: promisePostCreate,
    promisePostUpdate: promisePostUpdate,
    promisePostRemove: promisePostRemove
};