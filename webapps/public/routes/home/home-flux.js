var Reflux = require('reflux');
var _ = require('lodash');
var Q = require('q');
var isomorphUtils = require('../../../../service/isomorph-utils');

var pagerFlux = require('../../components/nav-pager/nav-pager-flux');

var resources = require('./home-resources-client');
var resourcesServer = require('./home-resources-server');

var actionSyncOptions = {sync: true};
var actionAsyncOptions = {sync: false};

var actions = Reflux.createActions({
    'componentMounted': actionAsyncOptions,
    'queryChanged': actionSyncOptions,
    postsGet: actionSyncOptions,
    postsGetCompleted: actionSyncOptions,
    postsGetFailed: actionSyncOptions
});

var store = Reflux.createStore({
    listenables: actions,

    promiseDataToPreload: function getPreloads(routeState, request) {
        var dataToPreload = {};
        if(_.isEmpty(resourcesServer)){
            return null;
        }
        // TODO check routeState to determine if preload really needed
        return resourcesServer.getSettings()
            .then(function (appSettings) {
                dataToPreload.settings = appSettings;
                return resourcesServer.getPosts(routeState.query, request.preferredLocale, appSettings.postsPerPage);
            })
            .then(function (initialPosts) {
                dataToPreload.posts = initialPosts;
                return dataToPreload;
            });
    },

    setPreloadedData: function preload(preloadedData) {
        this.posts = preloadedData.posts;
        this.settings = preloadedData.settings;
    },

    onComponentMounted: function () {

    },
    onQueryChanged: function (nextQuery) {
        getPosts(nextQuery);
    },
    onPostsGet: function () {
        this.loading = true;
        this.trigger(this.getViewModel());
    },
    onPostsGetCompleted: function (posts) {
        this.error = false;
        this.loading = false;
        this.posts = posts;
        this.trigger(this.getViewModel());
        // TODO should add skip and limit
        pagerFlux.actions.paginationUrlsChanged(isomorphUtils.generatePaginationUrlParams(posts), 0, 5);
    },
    onPostsGetFailed: function (err) {
        this.error = err;
        this.loading = false;
        this.trigger(this.getViewModel());
    },
    posts: [],
    settings: null,
    loading: false,
    error: null,
    getViewModel: function () {
        return {
            posts: this.posts,
            settings: this.settings,
            loading: this.loading,
            error: this.error
        };
    }
});

function getPosts(query) {
    actions.postsGet();
    resources.getPosts(query)
        .then(function (posts) {
            actions.postsGetCompleted(posts);
        })
        ['catch'](function (err) {
        actions.postsGetFailed(err);
    });
}

module.exports = {
    actions: actions,
    store: store
};
