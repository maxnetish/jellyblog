var Reflux = require('reflux');
var _ = require('lodash');
var resources = require('./admin-posts-list-resources');

var postEditFlux = require('../admin-post-edit/admin-post-edit-flux');

var LIMIT = 10;

var actionSyncOptions = {sync: true};
var actionAsyncOptions = {sync: false};
var actions = Reflux.createActions({
    'componentMounted': actionAsyncOptions,
    'dataGet': actionAsyncOptions,
    'dataGetCompleted': actionAsyncOptions,
    'dataGetFailed': actionAsyncOptions,
    'queryChanged': actionAsyncOptions,
    'postSelected': actionAsyncOptions,
    'createNewPost': actionAsyncOptions
});

var store = Reflux.createStore({
    listenables: actions,

    init: function () {
        this.listenTo(postEditFlux.actions.postCreateCompleted, this.onPostCreateCompleted);
        this.listenTo(postEditFlux.actions.postRemoveCompleted, this.onPostRemoveCompleted);
        this.listenTo(postEditFlux.actions.postUpdateCompleted, this.onPostUpdateCompleted);
    },

    onComponentMounted: function (routeQuery) {
        if ((this.loadOnce) && _.eq(routeQuery, this.currentRouteQuery)) {
            return;
        }

        var query = _.assign(_.cloneDeep(routeQuery), {
            limit: LIMIT,
            skip: routeQuery.skip || 0,
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

        if (dataChunk.length < LIMIT) {
            this.nextSkip = null;
        } else {
            this.nextSkip = parseInt((this.currentRouteQuery.skip || 0)) + LIMIT;
        }
        if (this.currentRouteQuery.skip && this.currentRouteQuery.skip !== '0') {
            this.previousSkip = this.currentRouteQuery.skip - LIMIT;
            this.previousSkip = this.previousSkip < 0 ? 0 : this.previousSkip;
        } else {
            this.previousSkip = null;
        }

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
            includeDraft: true
        });

        this.posts.length = 0;
        this.loadOnce = true;
        this.currentRouteQuery = _.cloneDeep(routeQuery);

        updatePostsList(query);
    },
    onPostSelected: function (postId) {
        this.activePostId = postId;
        this.trigger(this.getViewModel());
    },
    onCreateNewPost: function () {
        this.activePostId = 'NEW';
        this.trigger(this.getViewModel());
    },
    onPostCreateCompleted: function (postData) {
        var query = _.assign(_.cloneDeep(this.currentRouteQuery), {
            limit: LIMIT,
            includeDraft: true
        });
        this.posts.length = 0;
        this.activePostId = postData._id;
        updatePostsList(query);
    },
    onPostRemoveCompleted: function (postData) {
        _.remove(this.posts, function (p) {
            return p._id === postData._id
        });
        if (this.activePostId === postData._id) {
            this.activePostId = null;
        }
        this.trigger(this.getViewModel());
    },
    onPostUpdateCompleted: function (postData) {
        var updatedPostInfo = _.find(this.posts, function (p) {
            return p._id === postData._id;
        });
        if (!updatedPostInfo) {
            return;
        }
        updatedPostInfo.title = postData.title;
        updatedPostInfo.date = postData.date;
        updatedPostInfo.draft = postData.draft;
        this.trigger(this.getViewModel());
    },

    loadOnce: false,
    currentRouteQuery: {},
    posts: [],
    loading: false,
    error: null,
    activePostId: null,
    previousSkip: null,
    nextSkip: null,

    getViewModel: function () {
        return {
            posts: this.posts,
            loading: this.loading,
            error: this.error,
            activePostId: this.activePostId,
            previousSkip: this.previousSkip,
            nextSkip: this.nextSkip
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
