var Reflux = require('reflux');
var _ = require('lodash');
var resources = require('./avatar-list-resources');

var actionSyncOptions = {sync: true};
var actionAsyncOptions = {sync: false};
var actions = Reflux.createActions({
    'dataGet': actionSyncOptions,
    'dataGetCompleted': actionSyncOptions,
    'dataGetFailed': actionSyncOptions,
    'avatarRemoveCompleted': actionSyncOptions,
    'avatarRemoveFailed': actionSyncOptions,
    //'avatarSelect': actionSyncOptions,
    'avatarRemove': actionSyncOptions,
    'avatarAdded': actionAsyncOptions,
    'componentMounted': actionAsyncOptions
});

var store = Reflux.createStore({
    listenables: actions,

    onComponentMounted: function () {
        if (!this.dataGetOnce) {
            getData();
        }
    },
    onDataGet: function () {
        this.loading = true;
        this.trigger(this.getViewModel());
    },
    onDataGetCompleted: function (result) {
        this.loading = false;
        this.dataGetOnce = true;
        this.avatarList = _.cloneDeep(result);
        this.trigger(this.getViewModel());
    },
    onDataGetFailed: function (err) {
        this.loading = false;
        this.error = err;
        console.log(err);
        this.trigger(this.getViewModel());
    },
    //onAvatarSelect: function (avatarFileInfo) {
    //    this.selectedAvatar = avatarFileInfo;
    //    this.trigger(this.getViewModel());
    //},
    onAvatarRemove: function (avatarFileInfo) {
        removeAvatar(avatarFileInfo);
    },
    onAvatarRemoveCompleted: function (removeResult) {
        _.remove(this.avatarList, function (oneExisting) {
            return _.any(removeResult, function (oneRemoved) {
                return oneRemoved._id === oneExisting._id;
            });
        });
        this.trigger(this.getViewModel());
    },
    onAvatarRemoveFailed: function (err) {
        this.error = err;
        console.log(err);
        this.trigger(this.getViewModel());
    },
    onAvatarAdded: function (avatarInfo) {
        this.avatarList.unshift(avatarInfo);
        this.trigger(this.getViewModel());
    },

    getViewModel: function () {
        return {
            avatarList: this.avatarList,
            //selectedAvatar: this.selectedAvatar,
            loading: this.loading,
            error: this.error
        };
    },

    dataGetOnce: false,

    avatarList: [],
    //selectedAvatar: null,
    loading: false,
    error: null
});

function getData() {
    actions.dataGet();
    resources.getAvatarList()
        .then(function (result) {
            actions.dataGetCompleted(result);
            return result;
        })
        ['catch'](function (err) {
        actions.dataGetFailed(err);
    });
}

function removeAvatar(avatarInfo) {
    resources.removeAvatar(avatarInfo)
        .then(function (result) {
            actions.avatarRemoveCompleted(result);
            return result;
        })
        ['catch'](function (err) {
        actions.avatarRemoveFailed(err);
    })
}

module.exports = {
    actions: actions,
    store: store
};
