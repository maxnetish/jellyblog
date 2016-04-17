var Reflux = require('reflux');
var _ = require('lodash');
var Q = require('q');

//var resources = require('./layout-resources-client');
//var resourcesServer = require('./layout-resources-server');

var actionSyncOptions = {sync: true};
var actionAsyncOptions = {sync: false};

var actions = Reflux.createActions({
    'queryChanged': actionSyncOptions
});

var resourcesServer = require('./layout-resources-server');

var store = Reflux.createStore({
    listenables: actions,

    promiseDataToPreload: function getPreloads(routeState, request) {
        var dataToPreload = {};
        var internPromises = [];

        if (_.isEmpty(resourcesServer)) {
            return null;
        }

        internPromises.push(resourcesServer.getMiscSettings());
        internPromises.push(resourcesServer.getNavlinks());

        return Q.all(internPromises)
            .then(function (result) {
                dataToPreload.misc = result[0];
                dataToPreload.navlinks = result[1];
                return dataToPreload;
            });
    },

    setPreloadedData: function preload(preloadedData) {
        this.misc = preloadedData.misc;
        this.navlinks = preloadedData.navlinks;
    },

    onQueryChanged: function (nextQuery) {

    },

    // data:
    misc: null,
    navlinks: null,
    getViewModel: function () {
        return {
            misc: this.misc,
            navlinks: this.navlinks
        };
    }
});

module.exports = {
    actions: actions,
    store: store
};
