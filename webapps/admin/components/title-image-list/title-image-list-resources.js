var request = require('superagent');
var Q = require('q');

function getImageTitleList() {
    var dfr = Q.defer();

    request
        .get('/api/upload')
        .query({
            category: 'site-title-image'
        })
        .end(function (err, response) {
            if (err) {
                dfr.reject(err);
                return;
            }
            dfr.resolve(response.body);
        });

    return dfr.promise;
}

function removeImageTitle(fileInfo) {
    var dfr = Q.defer();

    request
        .del('/api/upload')
        .query({
            _id: fileInfo._id
        })
        .end(function (err, response) {
            if (err) {
                dfr.reject(err);
                return;
            }
            dfr.resolve(response.body);
        });

    return dfr.promise;
}

module.exports = {
    getImageTitleList: getImageTitleList,
    removeImageTitle: removeImageTitle
};