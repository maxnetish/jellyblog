var model = require('../../models').model,
    _ = require('lodash'),
    Q = require('q');

function promiseLogEntries (params) {
    var stream, query, skip, afterId, limit, dfr, result, found;

    var reject = function (err) {
            dfr.reject(err);
        },
        resolve = function () {
            dfr.resolve(result);
        },
        iterateDoc = function (doc) {
            if (found) {
                if (result.push(doc) === limit) {
                    resolve();
                    stream.destroy();
                }
            } else {
                found = doc._id.equals(afterId);
            }
        };

    params = params || {};
    afterId = params.afterId;
    limit = parseInt(params.limit, 10);
    skip = params.skip;

    if (!afterId) {
        query = model.Log.find(null, null, {
            sort: '-date',
            skip: skip,
            limit: limit
        });
        return query.exec();
    }

    result = [];
    dfr = Q.defer();
    limit = limit || 0;
    stream = model.Log.find(null, null, {
        sort: '-date'
    }).stream();

    stream
        .on('data', iterateDoc)
        .on('error', reject)
        .on('close', resolve);

    return dfr.promise;
}

module.exports = {
    promiseLogEntries: promiseLogEntries
};