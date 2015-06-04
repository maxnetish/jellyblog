var request = require('superagent');
var Q = require('q');

function getGeneralSettings() {
    var dfr = Q.defer();
    request
        .get('/api/settings')
        .end(function (err, result) {
            if (err) {
                dfr.reject(err);
                return;
            }
            dfr.resolve(result.body);
        });

    return dfr.promise;
}

function updateGeneralSettings(data) {
    var dfr = Q.defer();

    request
        .post('/api/settings')
        .send(data)
        .end(function (err, res) {
            if (err) {
                dfr.reject(err);
                return;
            }
            dfr.resolve(res.body);
        });

    return dfr.promise;
}

module.exports = {
    getData: getGeneralSettings,
    updateData: updateGeneralSettings
};
