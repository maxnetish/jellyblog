var Q = require('q');
var _ = require('lodash');

function doStoresPreloadData(fluxes, request, routeState) {
    var promises = [];
    fluxes = fluxes || [];
    routeState = routeState || {};
    _.each(fluxes, function (one) {
        if (one.store && one.store.promiseDataToPreload) {
            promises.push(one.store.promiseDataToPreload(routeState, request));
        }
    });
    return Q.all(promises)
        .then(function (results) {
            var res = _.reduce(results, function (accum, value) {
                return _.assign(accum, value);
            }, {});
            return res;
        });
}

function doStoresSetPreloadedData(fluxes, preloadedData) {
    _.each(fluxes, function (one) {
        if (one.store && one.store.setPreloadedData) {
            one.store.setPreloadedData(preloadedData);
        }
    });
}

function inBrowser() {
    return !(typeof window === 'undefined');
}

module.exports = {
    doStoresPreloadData: doStoresPreloadData,
    doStoresSetPreloadedData: doStoresSetPreloadedData,
    inBrowser: inBrowser
};
