/**
 * Created by Gordeev on 29.06.2014.
 */
var fs = require('fs-extra-promise');
var path = require('path');
var Q = require('q');
var config = require('../config');
var _ = require('lodash');

function removeFileByMetaInfo(metaInfo){
    var infos,
        promises;

    if(_.isArray(metaInfo)){
        infos = metaInfo;
    }else if(!_.isEmpty(metaInfo)){
        infos = [metaInfo];
    }else{
        infos = [];
    }

    promises = _.map(infos, function(oneFileInfo){
        var pathToRemove = path.join(__dirname, '..', config.fileStore.uploadPath, oneFileInfo.fileName);
        return fs.unlinkAsync(pathToRemove);
    });

    return Q.all(promises);
}

module.exports = {
    removeFileByMetaInfo: removeFileByMetaInfo
};