module.exports = {

    promisePaginationPostsList: require('./posts').promisePaginationPostsList,
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
    promiseLogEntries: require('./log').promiseLogEntries,
    promiseFileStoreMetaCreateFromMultFileInfo: require('./file-store-meta').promiseFileStoreMetaCreateFromMultFileInfo,
    promiseFileMetaList: require('./file-store-meta').promiseFileMetaList,
    promiseFileMetaRemove: require('./file-store-meta').promiseFileMetaRemove
};