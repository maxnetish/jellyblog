var request = require('superagent');
var Q = require('q');

function getPostDetails(postId) {
    var dfr = Q.defer();

    request
        .get('/api/post')
        .query({
            id: postId
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
    getPostDetails: getPostDetails
};