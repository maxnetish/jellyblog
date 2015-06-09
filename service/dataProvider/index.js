
/**
 * Created by Gordeev on 13.06.2014.
 */

var model = require('../models').model,
    _ = require('lodash'),
    Q = require('q');

var promiseLogEntries = function (params) {
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
};

function promiseFileStoreMetaCreateFromMultFileInfo(multFilesInfo, uploader){
    var result;
    var filesMeta = _.map(multFilesInfo, function(mult, fieldName){
        return {
            fileName: mult.name,
            uploadDate: new Date(),
            uploader: uploader,
            category: fieldName,
            originalFileName: mult.originalname,
            mimeType: mult.mimetype,
            size: mult.size
        }
    });
    result = model.FileStoreMeta.create(filesMeta);
    return result;
}

function promiseFileStoreMetaList(category, pagination){

}

module.exports = {

    promisePostsList: require('./posts').promisePostsList,
    promisePostGetBySlug: require('./posts').promisePostGetBySlug,
    promisePostGetById: require('./posts').promisePostGetById,
    promisePostCreate: require('./posts').promisePostCreate,
    promisePostUpdate: require('./posts').promisePostUpdate,
    promisePostRemove: require('./posts').promisePostRemove,
    promisePostRemoveAll: require('./posts').promisePostRemoveAll,
    promisePostGetAdjacent: require('./posts').promisePostGetAdjacent,
    promiseNavlinkCreate: require('./navlinks').promiseNavlinkCreate,
    promiseNavlinkUpdate: require('./navlinks').promiseNavlinkUpdate,
    promiseNavlinkRemove: require('./navlinks').promiseNavlinkRemove,
    promiseNavlinkList: require('./navlinks').promiseNavlinkList,
    promiseSettings: require('./settings').promiseSettings,
    promiseSettingsUpdate: require('./settings').promiseSettingsUpdate,
    promiseLogEntries: promiseLogEntries,
    promiseFileStoreMetaCreateFromMultFileInfo: promiseFileStoreMetaCreateFromMultFileInfo
};