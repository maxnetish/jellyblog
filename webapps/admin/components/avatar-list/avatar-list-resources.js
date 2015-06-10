var request = require('superagent');
var Q = require('q');

function getAvatarList() {
    var dfr = Q.defer();

    request
        .get('/api/upload')
        .query({
            category: 'avatar-image'
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

function removeAvatar(avatarInfo) {
    var dfr = Q.defer();

    request
        .del('/api/upload')
        .query({
            _id: avatarInfo._id
        })
        .end(function (err, result) {
            if (err) {
                dfr.reject(err);
                return;
            }
            dfr.resolve(result.body);
        });

    return dfr.promise;
}

module.exports = {
    getAvatarList: getAvatarList,
    removeAvatar: removeAvatar
};