var Reflux = require('reflux');
var _ = require('lodash');
var resources = require('./admin-post-edit-resources');
var uploadUtils = require('../../../common/upload-utils');
var commonDialogs = require('../../../common/components/common-dialogs/common-dialogs-service');

var avatarListFlux = require('../avatar-list/avatar-list-flux');

var actionSyncOptions = {sync: true};
var actionAsyncOptions = {sync: false};
var actions = Reflux.createActions({
    'componentMounted': actionAsyncOptions,
    'queryChanged': actionAsyncOptions,
    'dataGet': actionAsyncOptions,
    'dataGetCompleted': actionAsyncOptions,
    'dataGetFailed': actionAsyncOptions,
    'postFieldChanged': actionSyncOptions,
    'applyPostImage': actionAsyncOptions,
    'tagsGetCompleted': actionAsyncOptions,
    'tagsGetFailed': actionAsyncOptions,
    'postUpdate': actionAsyncOptions,
    'postUpdateCompleted': actionAsyncOptions,
    'postUpdateFailed': actionAsyncOptions
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
        // to not handle content field changes (brace editor emit unwanted change events)
        this._notTrackFieldChanges = true;
        this.trigger(this.getViewModel());
        this._notTrackFieldChanges = false;
    },
    onDataGetFailed: function (err) {
        this.loading = false;
        this.error = err;
        this.trigger(this.getViewModel());
    },
    onComponentMounted: function (postId) {
        if (!this._tagsLoaded) {
            getTags();
            this._tagsLoaded = true;
        }
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
    onPostFieldChanged: function (payload) {
        if (this._notTrackFieldChanges) {
            return;
        }
        this.post = _.assign(this.post, payload);
        this.pristine = false;

        if (payload['tags']) {
            this.tags = updateInternalTags(payload.tags, this.tags);
        }

        this.trigger(this.getViewModel());
    },
    onApplyPostImage: function (data) {
        var self = this;
        uploadUtils.uploadFileFromDataUrl(data)
            .then(function (result) {
                if (result && result.length) {
                    self.onPostFieldChanged({
                        image: result[0].url
                    });
                    avatarListFlux.actions.avatarAdded(result[0]);
                }
                return result;
            })
            ['catch'](function (err) {
            console.log(err);
        });
    },
    onTagsGetCompleted: function (payload) {
        this.tags = payload;
        this.trigger(this.getViewModel());
    },
    onTagsGetFailed: function (err) {
        this._tagsLoaded = true;
        console.log(err);
    },
    onPostUpdate: function(postData){
        updatePost(postData);
    },
    onPostUpdateCompleted: function(postData){
        this.loading = false;
        this.error = null;
        this.pristine = true;
        this.post = _.cloneDeep(postData);
        // to not handle content field changes (brace editor emit unwanted change events)
        this._notTrackFieldChanges = true;
        this.trigger(this.getViewModel());
        this._notTrackFieldChanges = false;
    },
    onPostUpdateFailed: function(err){
        this.loading = false;
        this.error = err;
        this.trigger(this.getViewModel());
        commonDialogs.error(err);
    },

    _tagsLoaded: false,
    _notTrackFieldChanges: false,

    post: null,
    loading: false,
    error: null,
    pristine: true,
    tags: null,

    getViewModel: function () {
        return {
            post: this.post,
            loading: this.loading,
            error: this.error,
            pristine: this.pristine,
            tags: this.tags
        };
    }
});

function updateInternalTags(newPostTags, allTags) {
    _.each(newPostTags, function (newTag) {
        if (_.indexOf(allTags, newTag) !== -1) {
            return;
        }
        allTags.splice(_.sortedIndex(allTags, newTag), 0, newTag);
    });
    return allTags;
}

function getTags() {
    resources.getAllTags()
        .then(function (result) {
            actions.tagsGetCompleted(result);
            return result;
        })
        ['catch'](function (err) {
        actions.tagsGetFailed(err);
        return err;
    });
}

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

function updatePost(postData) {
    actions.dataGet();
    resources.updatePost(postData)
        .then(function (result) {
            actions.postUpdateCompleted(result);
            return result;
        })
        ['catch'](function (err) {
        actions.postUpdateFailed(err);
        return err;
    });
}

module.exports = {
    actions: actions,
    store: store
};