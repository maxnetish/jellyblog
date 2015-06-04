var request = require('superagent');
var Q = require('q');

function getGeneralSettings() {
    var dfr = Q.defer();
    request
        .get('/api/settings')
        .end(function(err, result){
            if(err){
                dfr.reject(err);
                return;
            }
            dfr.resolve(result.body);
        });

    return dfr.promise;
}

module.exports = {
    getData: getGeneralSettings
};
