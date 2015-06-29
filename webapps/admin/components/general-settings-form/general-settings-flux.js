var Reflux = require('reflux');
var _ = require('lodash');
var resources = require('./general-settings-resources');
var avatarListFlux = require('../avatar-list/avatar-list-flux');
var titleImageFlux = require('../title-image-list/title-image-list-flux');

var actionSyncOptions = {sync: true};
var actionAsyncOptions = {sync: false};
var actions = Reflux.createActions({
    'valueChanged': actionSyncOptions,
    'dataGet': actionSyncOptions,
    'dataGetCompleted': actionSyncOptions,
    'dataGetFailed': actionSyncOptions,
    'dataSave': actionSyncOptions,
    'dataSaveCompleted': actionSyncOptions,
    'dataSaveFailed': actionSyncOptions,
    'userForceSave': actionSyncOptions,
    'applyNewAvatar': actionSyncOptions,
    'applyNewTitleImage': actionSyncOptions,
    'componentMounted': actionAsyncOptions
});

var store = Reflux.createStore({
    listenables: actions,
    init: function () {
        this.listenTo(avatarListFlux.actions.avatarRemoveCompleted, this.onAvatarRemoveCompleted);
        this.listenTo(titleImageFlux.actions.titleImageRemoveCompleted, this.onTitleImageRemoveCompleted);
    },
    onValueChanged: function (payload) {
        if (!(payload && payload.key)) {
            return;
        }
        this.data[payload.key] = payload.value;
        this.pristine = false;
        this.trigger(this.getViewModel());
        if (payload.valid) {
            saveDataDebounce(this.data);
        } else {
            saveDataDebounce.cancel();
        }
    },
    onComponentMounted: function () {
        // some form elements in some browsers (yep, IE)
        // fires change event immediately after React inserts elem in DOM before whole component mounted,
        // so we should not rely on state of data prop
        // because after change event 'data' may become not empty
        if (!this.retrievedOnce) {
            getData();
        }
    },
    onDataGet: function () {
        this.retrievedOnce = true;
        this.loading = true;
        this.trigger(this.getViewModel());
    },
    onDataGetCompleted: function (gettedData) {
        this.data = _.cloneDeep(gettedData);
        this.loading = false;
        this.pristine = true;
        this.error = null;
        this.trigger(this.getViewModel());
    },
    onDataGetFailed: function (err) {
        this.loading = false;
        this.error = err;
        console.log(err);
        this.trigger(this.getViewModel());
    },
    onDataSave: function () {
        this.saving = true;
        this.trigger(this.getViewModel());
    },
    onDataSaveCompleted: function (res) {
        this.data = _.assign(this.data, res);
        this.saving = false;
        this.pristine = true;
        this.error = null;
        this.trigger(this.getViewModel());
    },
    onDataSaveFailed: function (err) {
        this.saving = false;
        this.error = err;
        console.log(err);
        this.trigger(this.getViewModel());
    },
    onUserForceSave: function () {
        // supress debounced invocation
        saveDataDebounce.cancel();
        // and invoke sync
        saveData(this.data);
    },
    onApplyNewAvatar: function (avatarDataUrl) {
        var self = this;
        resources.uploadFileFromDataUrl(avatarDataUrl)
            .then(function (result) {
                console.log(result);
                if (result && result.length) {
                    self.onValueChanged({
                        key: 'authorAvatarUrl',
                        value: result[0].url,
                        valid: true
                    });
                    avatarListFlux.actions.avatarAdded(result[0]);
                }
            })
            ['catch'](function (err) {
            console.log(err);
        });
    },
    onApplyNewTitleImage: function(titleImageDataUrl){
        var self = this;
        resources.uploadFileFromDataUrl(titleImageDataUrl, 'site-title-image', 'site-title.png')
            .then(function (result) {
                if (result && result.length) {
                    self.onValueChanged({
                        key: 'titleImageUrl',
                        value: result[0].url,
                        valid: true
                    });
                    //avatarListFlux.actions.avatarAdded(result[0]);
                }
            })
            ['catch'](function (err) {
            console.log(err);
        });
    },
    onAvatarRemoveCompleted: function (removedInfos) {
        if (_.any(removedInfos, function (info) {
                return info.url === this.data.authorAvatarUrl;
            }, this)) {
            this.onValueChanged({
                key: 'authorAvatarUrl',
                value: null,
                valid: true
            });
        }
    },
    onTitleImageRemoveCompleted: function(removedInfos){
        if (_.any(removedInfos, function (info) {
                return info.url === this.data.titleImageUrl;
            }, this)) {
            this.onValueChanged({
                key: 'titleImageUrl',
                value: null,
                valid: true
            });
        }
    },

    getViewModel: function () {
        return {
            data: this.data,
            pristine: this.pristine,
            loading: this.loading,
            saving: this.saving,
            error: this.error
        };
    },

    retrievedOnce: false,

    data: {},
    pristine: true,
    loading: false,
    saving: false,
    error: null
});

var saveDataDebounce = _.debounce(saveData, 10000);

function getData() {
    actions.dataGet();
    resources.getData()
        .then(function (result) {
            actions.dataGetCompleted(result);
            return result;
        })
        ['catch'](function (err) {
        actions.dataGetFailed(err);
    });
}

function saveData(model) {
    actions.dataSave();
    resources.updateData(model)
        .then(function (res) {
            actions.dataSaveCompleted(res);
            return res;
        })
        ['catch'](function (err) {
        actions.dataSaveFailed(err);
    });
}

module.exports = {
    actions: actions,
    store: store
};
