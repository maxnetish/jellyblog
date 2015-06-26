var Reflux = require('reflux');
var _ = require('lodash');
var resources = require('./admin-posts-list-resources');

var LIMIT = 16;

var actionSyncOptions = {sync: true};
var actionAsyncOptions = {sync: false};
var actions = Reflux.createActions({
    'componentMounted': actionAsyncOptions,
    'dataGet': actionAsyncOptions,
    'dataGetCompleted': actionAsyncOptions,
    'dataGetFailed': actionAsyncOptions,
    'queryChanged': actionAsyncOptions
});

var store = Reflux.createStore({
    listenables: actions,

    onComponentMounted: function (routeQuery) {
        if ((this.loadOnce) && _.eq(routeQuery, this.currentRouteQuery)) {
            return;
        }

        var query = _.assign(_.cloneDeep(routeQuery), {
            limit: LIMIT,
            skip: 0,
            includeDraft: true
        });

        this.posts.length = 0;
        this.loadOnce = true;
        this.currentRouteQuery = _.cloneDeep(routeQuery);

        updatePostsList(query);
    },
    onDataGet: function () {
        this.loading = true;
        this.trigger(this.getViewModel());
    },
    onDataGetCompleted: function (dataChunk) {
        this.loading = false;
        this.loadOnce = true;
        this.error = null;
        Array.prototype.push.apply(this.posts, dataChunk);
        this.trigger(this.getViewModel());
    },
    onDataGetFailed: function (err) {
        this.loading = false;
        this.error = err;
        this.trigger(this.getViewModel());
    },
    onQueryChanged: function (routeQuery) {
        if (_.eq(routeQuery, this.currentRouteQuery)) {
            return;
        }

        var query = _.assign(_.cloneDeep(routeQuery), {
            limit: LIMIT,
            skip: 0,
            includeDraft: true
        });

        this.posts.length = 0;
        this.loadOnce = true;
        this.currentRouteQuery = _.cloneDeep(routeQuery);

        updatePostsList(query);
    },

    loadOnce: false,
    currentRouteQuery: {},
    posts: [],
    loading: false,
    error: null,

    getViewModel: function () {
        return {
            posts: this.posts,
            loading: this.loading,
            error: this.error
        };
    }

});

function updatePostsList(query) {
    actions.dataGet();
    resources.getPosts(query)
        .then(function (result) {
            actions.dataGetCompleted(result);
        })
        ['catch'](function (err) {
        actions.dataGetFailed(err);
    });
}

module.exports = {
    actions: actions,
    store: store
};
