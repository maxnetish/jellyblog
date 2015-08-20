var Reflux = require('reflux');
var _ = require('lodash');
var Q = require('q');

var resources = require('./home-resources');

var actionSyncOptions = {sync: true};
var actionAsyncOptions = {sync: false};

var actions = Reflux.createActions({
    'setInitialData': actionSyncOptions,
    'componentMounted': actionAsyncOptions,
    'queryChanged': actionSyncOptions,
    postsGet: actionSyncOptions,
    postsGetCompleted: actionSyncOptions,
    postsGetFailed: actionSyncOptions
});

var store = Reflux.createStore({
    listenables: actions,

    onSetInitialData: function (posts) {
        this.posts = posts;
        this.error = null;
    },
    onComponentMounted: function () {

    },
    onQueryChanged: function (nextQuery) {
        getPosts(nextQuery);
    },
    onPostsGet: function(){
        this.loading = true;
        this.trigger(this.getViewModel());
    },
    onPostsGetCompleted: function(posts){
        this.error = false;
        this.loading = false;
        this.posts = posts;
        this.trigger(this.getViewModel());
    },
    onPostsGetFailed: function(err){
        this.error = err;
        this.loading = false;
        this.trigger(this.getViewModel());
    },
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
