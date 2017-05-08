var request = require('superagent');
var Q = require('q');
var _ = require('lodash');

function list() {
    var dfr = Q.defer();

    request
        .get('/api/navlinks')
        .end(function (err, response) {
            if (err) {
                dfr.reject(err);
                return;
            }
            dfr.resolve(response.body);
        });

    return dfr.promise;
}

function create(navlink) {
    var dfr = Q.defer();
    var payload = _.omit(navlink, '_id');

    request
        .post('/api/navlink')
        .send(payload)
        .end(function (err, response) {
            if (err) {
                dfr.reject(err);
                return;
            }
            dfr.resolve(response.body);
        });

    return dfr.promise;
}

function put(navlink) {
    var dfr = Q.defer();

    request
        .put('/api/navlink')
        .send(navlink)
        .end(function (err, response) {
            if (err) {
                dfr.reject(err);
                return;
            }
            dfr.resolve(response.body);
        });

    return dfr.promise;
}

function remove(id) {
    var dfr = Q.defer();

    request
        .del('/api/navlink')
        .query({id: id})
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
    list: list,
    create: create,
    put: put,
    remove: remove
};