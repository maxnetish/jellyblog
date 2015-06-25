var request = require('superagent');
var Q = require('q');

function getPosts(query) {
    var dfr = Q.defer();

    request
        .get('/api/posts')
        .query(query)
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
    getPosts: getPosts
};
