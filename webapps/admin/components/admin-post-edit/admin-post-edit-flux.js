var Reflux = require('reflux');
var _ = require('lodash');
var resources = require('./admin-post-edit-resources');

var actionSyncOptions = {sync: true};
var actionAsyncOptions = {sync: false};
var actions = Reflux.createActions({
    'componentMounted': actionAsyncOptions,
    'queryChanged': actionAsyncOptions,
    'dataGet': actionAsyncOptions,
    'dataGetCompleted': actionAsyncOptions,
    'dataGetFailed': actionAsyncOptions,
    'postFieldChanged': actionSyncOptions
});

var store = Reflux.createStore({
    listenables: actions,

    onDataGet: function () {
        this.loading = true;
        this.trigger(this.getViewModel());
    },
    onDataGetCompleted: function (postData) {
        this.loading = false;
        this.error = null;
        this.pristine = true;
        this.post = _.cloneDeep(postData);
        this.trigger(this.getViewModel());
    },
    onDataGetFailed: function (err) {
        this.loading = false;
        this.error = err;
        this.trigger(this.getViewModel());
    },
    onComponentMounted: function (postId) {
        if (!postId) {
            return;
        }
        if (this.post && this.post._id === postId) {
            return;
        }
        getPostDetails(postId);
    },
    onQueryChanged: function (postId) {
        if (!postId) {
            return;
        }
        if (this.post && this.post._id === postId) {
            return;
        }
        getPostDetails(postId);
    },
    onPostFieldChanged: function(payload){
        this.post = _.assign(this.post, payload);
        this.pristine = false;
        this.trigger(this.getViewModel());
    },

    post: null,
    loading: false,
    error: null,
    pristine: true,


    getViewModel: function () {
        return {
            post: this.post,
            loading: this.loading,
            error: this.error,
            pristine: this.pristine
        };
    }
});

function getPostDetails(postId) {
    actions.dataGet();
    resources.getPostDetails(postId)
        .then(function (result) {
            actions.dataGetCompleted(result);
            return result;
        })
        ['catch'](function (err) {
        actions.dataGetFailed(err);
        return err;
    });
}

module.exports = {
    actions: actions,
    store: store
};