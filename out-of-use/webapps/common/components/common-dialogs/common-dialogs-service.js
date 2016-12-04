var Q = require('q');
var componentFlux = require('./common-dialogs-flux');

function showConfirm(data) {
    var dfr = Q.defer();
    componentFlux.actions.showConfirm({
        data: data,
        deferred: dfr
    });
    return dfr.promise;
}

function showError(err){
    var dfr = Q.defer();
    componentFlux.actions.showError({
        data: err,
        deferred: dfr
    });
    return dfr.promise;
}

module.exports = {
    confirm: showConfirm,
    error: showError
};
