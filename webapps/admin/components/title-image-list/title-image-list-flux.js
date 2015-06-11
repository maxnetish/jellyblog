var Reflux = require('reflux');
var _ = require('lodash');
var resources = require('./title-image-list-resources');

var actionSyncOptions = {sync: true};
var actionAsyncOptions = {sync: false};
var actions = Reflux.createActions({
    'dataGet': actionSyncOptions,
    'dataGetCompleted': actionSyncOptions,
    'dataGetFailed': actionSyncOptions,
    'titleImageRemoveCompleted': actionSyncOptions,
    'titleImageRemoveFailed': actionSyncOptions,
    'titleImageSelect': actionSyncOptions,
    'titleImageRemove': actionSyncOptions,
    'titleImageAdded': actionAsyncOptions,
    'componentMounted': actionAsyncOptions
});

var store = Reflux.createStore({
    listenables: actions,

    onComponentMounted: function () {
        if (!this.getDataOnce) {
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
        this.titleImageList = _.cloneDeep(result);
        this.trigger(this.getViewModel());
    },
    onDataGetFailed: function (err) {
        this.loading = false;
        this.error = err;
        console.log(err);
        this.trigger(this.getViewModel());
    },
    onTitleImageSelect: function (fileInfo) {
        this.selectedTitleImage = fileInfo;
        this.trigger(this.getViewModel());
    },
    onTitleImageRemove: function (fileInfo) {
        removeTitleImage(fileInfo);
    },
    onTitleImageRemoveCompleted: function (removeResult) {
        _.remove(this.titleImageList, function (oneExisting) {
            return _.any(removeResult, function (oneRemoved) {
                return oneRemoved._id === oneExisting._id;
            });
        });
        this.trigger(this.getViewModel());
    },
    onTitleImageRemoveFailed: function (err) {
        this.error = err;
        console.log(err);
        this.trigger(this.getViewModel());
    },
    onTitleImageAdded: function (fileInfo) {
        this.titleImageList.unshift(fileInfo);
        this.trigger(this.getViewModel());
    },

    getViewModel: function () {
        return {
            titleImageList: this.titleImageList,
            selectedTitleImage: this.selectedTitleImage,
            loading: this.loading,
            error: this.error
        };
    },

    dataGetOnce: false,

    titleImageList: [],
    selectedTitleImage: null,
    loading: false,
    error: null
});

function getData() {
    actions.dataGet();
    resources.getImageTitleList()
        .then(function (result) {
            actions.dataGetCompleted(result);
            return result;
        })
        ['catch'](function (err) {
        actions.dataGetFailed(err);
    })
}

function removeTitleImage(fileInfo) {
    resources.removeImageTitle(fileInfo)
        .then(function (result) {
            actions.titleImageRemoveCompleted(result);
            return result;
        })
        ['catch'](function (err) {
        actions.titleImageRemoveFailed(err);
    })
}

module.exports = {
    actions: actions,
    store: store
};