/**
 * Created by Gordeev on 13.06.2014.
 */

var model = require('../models').model,
    _ = require('underscore'),
    Q = require('q');

var sanitizeDate = function (row) {
    var result;

    if (row) {
        if (_.isDate(row)) {
            result = row;
        } else if (_.isString(row)) {
            result = new Date(row);
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

    if (row === 'on' || row === 'true') {
        result = true;
    } else if (row) {
        try {
            result = !!parseInt(row, 10);
        } catch (ignore) {
        }
    }
    return result;
};

var createCondition = function (queryParams) {
    var condition = {},
        fromDate,
        toDate,
        tag,
        search,
        featured,
        includeDraft;

    queryParams = queryParams || {};

    fromDate = sanitizeDate(queryParams.fromDate);
    toDate = sanitizeDate(queryParams.toDate);
    tag = queryParams.tag;
    search = queryParams.search;
    featured = sanitizeBoolean(queryParams.featured);
    includeDraft = sanitizeBoolean(queryParams.includeDraft);

    if (fromDate || toDate) {
        condition.date = {};
    }
    if (fromDate) {
        condition.date.$gt = fromDate;
    }
    if (toDate) {
        condition.date.$lt = toDate;
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

    return condition;
};

var promisePostRemove = function (id) {
    return model.Post.findByIdAndRemove(id).exec();
};

var promisePostUpdate = function (post) {
    var query,
        id = post._id;

    delete post._id;
    query = model.Post.findByIdAndUpdate(id, post);
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

var promisePostGetAdjacent = function (idOrSlug, queryParams) {
    var dfr = Q.defer(),
        fields = 'slug',
        condition = createCondition(queryParams),
        sort = queryParams.sort || '-date',
        options = {
            sort: sort
        };

    model.Post.find(condition, fields, options).exec()
        .then(function (list) {
            var centerItem = _.find(list, function (item) {
                    return idOrSlug === item._id.str || idOrSlug === item.slug;
                }),
                centerInd = _.indexOf(list, centerItem),
                prevItem, nextItem;

            if (centerInd > 0) {
                prevItem = list[centerInd - 1];
            }
            if (centerInd < list.length - 1) {
                nextItem = list[centerInd + 1];
            }
            dfr.resolve({
                prev: prevItem,
                next: nextItem
            });
            return list;
        })
        .then(null, function (err) {
            dfr.reject(err);
            return err;
        });

    return dfr.promise;
};

var promisePostsList = function (queryParams, allFields) {
    var query,
        condition,
        limit,
        skip,
        fields = allFields ? null : "title slug featured draft date",
        options,
        sort;

    queryParams = queryParams || {};
    condition = createCondition(queryParams);
    limit = parseInt(queryParams.limit, 10) || undefined;
    skip = parseInt(queryParams.skip, 10) || undefined;
    sort = queryParams.sort || '-date';
    options = {
        sort: sort,
        skip: skip,
        limit: limit
    };

    query = model.Post.find(condition, fields, options);
    return query.exec();
};

var promiseNavlinkList = function (categoryOrFilter) {
    var query,
        filter;

    if (_.isString(categoryOrFilter)) {
        filter = {
            category: categoryOrFilter
        };
    } else {
        filter = categoryOrFilter;
    }

    //category = category || 'main';

    query = model.Navlink.find(filter, null, {
        sort: 'order'
    });
    return query.exec();
};

var promiseNavlinkCreate = function (navlink) {
    var promise;

    // some post validation?
    promise = model.Navlink.create(navlink);
    return promise;
};

var promiseNavlinkUpdate = function (navlink) {
    var query,
        id = navlink._id;

    delete navlink._id;
    query = model.Navlink.findByIdAndUpdate(id, navlink);
    return query.exec();
};

var promiseNavlinkRemove = function (id) {
    return model.Navlink.findByIdAndRemove(id).exec();
};

var promiseSettings = function () {
    var query,
        dfr = Q.defer();

    query = model.Settings.find(null, null, {
        limit: 1
    });

    query.exec()
        .then(function (result) {
            if (result && result.length) {
                dfr.resolve(result[0]);
            } else {
                // have to create one
                model.Settings.create({})
                    .then(function (newSettings) {
                        dfr.resolve(newSettings);
                    })
                    .then(null, function (err) {
                        dfr.reject(err);
                    });
            }
        })
        .then(null, function (err) {
            dfr.reject(err);
        });

    return dfr.promise;
};

var promiseSettingsUpdate = function (settings) {
    var query,
        id = settings._id;

    delete settings._id;
    query = model.Settings.findByIdAndUpdate(id, settings);

    return query.exec();
};


module.exports = {
    promisePostsList: promisePostsList,
    promisePostGetBySlug: promisePostGetBySlug,
    promisePostGetById: promisePostGetById,
    promisePostCreate: promisePostCreate,
    promisePostUpdate: promisePostUpdate,
    promisePostRemove: promisePostRemove,
    promisePostGetAdjacent: promisePostGetAdjacent,
    promiseNavlinkCreate: promiseNavlinkCreate,
    promiseNavlinkUpdate: promiseNavlinkUpdate,
    promiseNavlinkRemove: promiseNavlinkRemove,
    promiseNavlinkList: promiseNavlinkList,
    promiseSettings: promiseSettings,
    promiseSettingsUpdate: promiseSettingsUpdate
};