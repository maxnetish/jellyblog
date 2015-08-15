var Reflux = require('reflux');
var _ = require('lodash');
var Q = require('q');

var actionSyncOptions = {sync: true};
var actionAsyncOptions = {sync: false};

var actions = Reflux.createActions({
    'setInitialData': actionSyncOptions,
    'componentMounted': actionAsyncOptions,
    'queryChanged': actionSyncOptions
});

var store = Reflux.createStore({
    listenables: actions,

    onSetInitialData: function(posts){
        this.posts = posts;
        this.error = null;
    },
    onComponentMounted: function () {

    },
    onQueryChanged: function () {

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

module.exports = {
    actions: actions,
    store: store
};
