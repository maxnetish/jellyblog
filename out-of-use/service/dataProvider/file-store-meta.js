var model = require('../../models').model,
    _ = require('lodash'),
    Q = require('q');

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

function promiseFileMetaList(queryParams){
    var condition,
        query,
        limit,
        skip,
        options,
        sort;

    limit = parseInt(queryParams.limit, 10) || undefined;
    skip = parseInt(queryParams.skip, 10) || undefined;
    sort = '-uploadDate';
    condition = _.omit(queryParams, ['limit', 'skip']);
    options = {
        sort: sort,
        skip: skip,
        limit: limit
    };

    query = model.FileStoreMeta.find(condition, null, options);
    return query.exec();
}

function promiseFileMetaRemove(criteria){
    var query;

    if(!criteria || _.isEmpty(criteria)){
        throw new Error('Criteria to remove is not provided');
    }

    query = model.FileStoreMeta.remove(criteria);
    return query.exec();
}

module.exports = {
    promiseFileStoreMetaCreateFromMultFileInfo: promiseFileStoreMetaCreateFromMultFileInfo,
    promiseFileMetaList: promiseFileMetaList,
    promiseFileMetaRemove: promiseFileMetaRemove
};