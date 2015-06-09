var model = require('../models').model,
    _ = require('lodash'),
    Q = require('q'),
    utils = require('./utils');

function createCondition (queryParams) {
    var condition = {},
        fromDate,
        toDate,
        tag,
        search,
        featured,
        includeDraft;

    queryParams = queryParams || {};

    fromDate = utils.sanitizeDate(queryParams.fromDate);
    toDate = utils.sanitizeDate(queryParams.toDate);
    tag = queryParams.tag;
    search = queryParams.search;
    featured = utils.sanitizeBoolean(queryParams.featured);
    includeDraft = utils.sanitizeBoolean(queryParams.includeDraft);

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
        condition.tags = tag;
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
}

function promisePostRemove (id) {
    return model.Post.findByIdAndRemove(id).exec();
}

function promisePostRemoveAll () {
    return model.Post.remove({}).exec();
}

function promisePostUpdate (post) {
    var query,
        id = post._id,
        update,
        fields;

    update = _.omit(post, ['_id']);
    fields = _.keys(update).join(' ');

    query = model.Post.findByIdAndUpdate(id, update, {select: fields});
    return query.exec();
}

function promisePostCreate (post) {
    var promise;

    // some post validation?
    promise = model.Post.create(post);
    return promise;
}

function promisePostGetById (id) {
    var query = model.Post.findById(id);
    return query.exec();
}

function promisePostGetBySlug (slug) {
    var query, condition;
    slug = slug || "";

    condition = {
        slug: slug
    };

    query = model.Post.findOne(condition);
    return query.exec();
}

function promisePostGetAdjacent (idOrSlug, queryParams) {
    var dfr = Q.defer(),
        fields = 'slug',
        condition = createCondition(queryParams),
        sort = queryParams.sort || '-date',
        options = {
            sort: sort
        },
        stream = model.Post.find(condition, fields, options).stream(),
        currentDoc, prevDoc, nextDoc,
        found = false, resolved = false,
        reject = function (err) {
            dfr.reject(err);
        },
        resolve = function () {
            if (!resolved) {
                resolved = true;
                dfr.resolve({
                    prev: prevDoc,
                    next: nextDoc
                });
            }
        },
        predicate = _.isString(idOrSlug) ?
            function (doc) {
                return idOrSlug === doc.slug;
            } :
            function (doc) {
                return doc._id.equals(idOrSlug);
            },
        iterateDoc = function (doc) {
            // do something with the mongoose document
            if (found) {
                // found doc on prev iteration, stop iteration
                nextDoc = doc;
                resolve();
                stream.destroy();
            } else {
                prevDoc = currentDoc;
                currentDoc = doc;
                found = predicate(doc);
            }
        };

    stream
        .on('data', iterateDoc)
        .on('error', reject)
        .on('close', resolve);

    return dfr.promise;
}

function promisePostsList (queryParams, allFields) {
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
}

module.exports = {
    promisePostsList: promisePostsList,
    promisePostGetBySlug: promisePostGetBySlug,
    promisePostGetById: promisePostGetById,
    promisePostCreate: promisePostCreate,
    promisePostUpdate: promisePostUpdate,
    promisePostRemove: promisePostRemove,
    promisePostRemoveAll: promisePostRemoveAll,
    promisePostGetAdjacent: promisePostGetAdjacent,
};