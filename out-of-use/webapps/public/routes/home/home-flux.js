var Reflux = require('reflux');
var _ = require('lodash');
var Q = require('q');
var isomorphUtils = require('../../../../service/isomorph-utils');

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
        if (_.isEmpty(resourcesServer)) {
            return null;
        }
        return resourcesServer.getSettings()
            .then(function (appSettings) {
                var queryLocal = _.cloneDeep(routeState.query);
                queryLocal = _.assign({
                    limit: appSettings.postsPerPage,
                    skip: 0
                }, queryLocal);
                dataToPreload.settings = appSettings;
                return resourcesServer.getPosts(queryLocal, request.preferredLocale, appSettings.postsPerPage);
            })
            .then(function (initialPosts) {
                dataToPreload.posts = initialPosts;
                dataToPreload.pager = buildPager(routeState.query, initialPosts, dataToPreload.settings);
                return dataToPreload;
            });
    },

    setPreloadedData: function preload(preloadedData) {
        this.posts = preloadedData.posts;
        this.settings = preloadedData.settings;
        this.pager = preloadedData.pager;
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
    onPostsGetCompleted: function (posts, query) {
        this.error = false;
        this.loading = false;
        this.posts = posts;
        this.pager = buildPager(query, posts, this.settings);
        this.trigger(this.getViewModel());
    },
    onPostsGetFailed: function (err) {
        this.error = err;
        this.loading = false;
        this.trigger(this.getViewModel());
    },

    /**
     * Data here:
     */
    posts: [],
    pager: {next: null, previous: null},
    settings: null,
    loading: false,
    error: null,

    getViewModel: function () {
        return {
            posts: this.posts,
            pager: this.pager,
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
            actions.postsGetCompleted(posts, query);
        })
        ['catch'](function (err) {
        actions.postsGetFailed(err);
    });
}

function buildPager(query, posts, settings) {
    var result = {
        next: null,
        previous: null
    };

    if (query.skip) {
        result.next = {
            skip: query.skip - settings.postsPerPage,
            limit: settings.postsPerPage
        };
        result.next.skip = result.next.skip >= 0 ? result.next.skip : 0;
    }

    if (posts.length >= settings.postsPerPage) {
        result.previous = {
            skip: (query.skip || 0) + settings.postsPerPage,
            limit: settings.postsPerPage
        };
    }

    return result;
}

module.exports = {
    actions: actions,
    store: store
};
