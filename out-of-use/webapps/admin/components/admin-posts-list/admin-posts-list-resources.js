var request = require('superagent');
var Q = require('q');
var _ = require('lodash');

function getPosts(query) {
    var dfr = Q.defer();
    var admQuery = _.assign(_.clone(query), {
        adm: true
    });

    request
        .get('/api/posts')
        .query(admQuery)
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
