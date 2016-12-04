var model = require('../../models').model,
    _ = require('lodash'),
    Q = require('q'),
    utils = require('./utils'),
    moment = require('moment');

function promisePostGetById(id) {
    var query = model.Post.findById(id);
    return query.exec();
}

function promiseAllTags() {
    var dfr = Q.defer(),
        fields = 'tags',
        queryOptions = {
            lean: true
        },
        stream = model.Post.find(null, fields, queryOptions).stream(),
        tags = [],
        reject = function (err) {
            dfr.reject(err);
        },
        resolve = function () {
            dfr.resolve(tags);
        },
        iterateDoc = function (doc) {
            var currentTags = doc && doc.tags;
            _.each(currentTags, function (currentTag) {
                if (_.indexOf(tags, currentTag) !== -1) {
                    return;
                }
                tags.splice(_.sortedIndex(tags, currentTag), 0, currentTag);
            });
        };

    stream
        .on('data', iterateDoc)
        .on('error', reject)
        .on('close', resolve);

    return dfr.promise;
}

module.exports = {
    promiseAllTags: promiseAllTags
};
