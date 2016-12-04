var Reflux = require('reflux');
var _ = require('lodash');
var Q = require('q');

var resources = require('./navlinks-editor-resources');

var newNavlinkIdPrefix = 'new-navlink-';

var actionSyncOptions = {sync: true};
var actionAsyncOptions = {sync: false};
var actions = Reflux.createActions({
    'valueChanged': actionSyncOptions,
    'componentMounted': actionAsyncOptions,
    'dataGet': actionSyncOptions,
    'dataGetCompleted': actionSyncOptions,
    'dataGetFailed': actionSyncOptions,
    'itemAdd': actionSyncOptions,
    'itemRemove': actionSyncOptions,
    'dataSave': actionSyncOptions,
    'dataSaveCompleted': actionSyncOptions,
    'dataSaveFailed': actionSyncOptions,
    'itemUpdate': actionSyncOptions,
    'dataRemoveCompleted': actionSyncOptions
});

var store = Reflux.createStore({
    listenables: actions,

    onValueChanged: function (payload) {
        /**
         * payload will be
         * {
         *      id,
         *      key,
         *      value,
         *      valid [all data valid, not only this field]
         * }
         *
         */

        if (!(payload && payload.id && payload.key)) {
            return;
        }
        this.data[payload.id][payload.key] = payload.value;
        this.pristine = false;
        if (!_.includes(this.itemsToPendingUpdate, payload.id)) {
            this.itemsToPendingUpdate.push(payload.id);
        }
        this.trigger(this.getViewModel());
        if (payload.valid) {
            saveDataDebounce(this.data, this.itemsToPendingUpdate, this.itemsToPendingRemove);
        } else {
            saveDataDebounce.cancel();
        }
    },
    onComponentMounted: function () {
        if (this.dataLoadOnce) {
            return;
        }
        getData();
    },
    onDataGet: function () {
        this.loading = true;
        this.trigger(this.getViewModel());
    },
    onDataGetCompleted: function (requestedData) {
        this.data = _.indexBy(requestedData, '_id');
        this.loading = false;
        this.pristine = true;
        this.error = null;
        this.dataLoadOnce = true;
        this.trigger(this.getViewModel());
    },
    onDataGetFailed: function (err) {
        this.loading = false;
        this.error = err;
        this.trigger(this.getViewModel());
    },
    onItemAdd: function (payload) {
        var model = payload.value;
        addItem(model);
    },
    onItemRemove: function (payload) {
        var navlink = payload.value;
        removeItem(navlink);
    },
    onItemUpdate: function (payload) {
        var navlink = payload.value;
        updateItem(navlink);
    },
    onDataSave: function () {
        this.loading = true;
        this.trigger(this.getViewModel());
    },
    onDataSaveCompleted: function (payload) {
        this.loading = false;
        this.pristine = true;
        this.error = null;
        this.data[payload._id] = payload;
        this.trigger(this.getViewModel());
    },
    onDataRemoveCompleted: function(payload){
        this.loading = false;
        this.pristine = true;
        this.error = null;
        delete this.data[payload._id];
        this.trigger(this.getViewModel());
    },
    onDataSaveFailed: function (err) {
        this.error = err;
        this.loading = false;
        this.trigger(this.getViewModel());
    },

    getViewModel: function () {
        return {
            data: this.data,
            pristine: this.pristine,
            loading: this.loading,
            error: this.error
        };
    },
    getNewNavlinkModel: function(category){
      return createNewNavlink(category, getNextOrderToPush(this.data));
    },

    dataLoadOnce: false,

    data: {},
    pristine: true,
    loading: false,
    error: null

});

function getData() {
    actions.dataGet();
    resources.list()
        .then(function (dataFromResponse) {
            actions.dataGetCompleted(dataFromResponse);
            return dataFromResponse;
        })
        ['catch'](function (err) {
        actions.dataGetFailed(err);
    });
}

function updateItem(model) {
    actions.dataSave();
    resources.put(model)
        .then(function (result) {
            actions.dataSaveCompleted(result);
        })
        ['catch'](function (err) {
        actions.dataSaveFailed(err);
    });
}

function addItem(model) {
    actions.dataSave();
    resources.create(model)
        .then(function (result) {
            actions.dataSaveCompleted(result);
        })
        ['catch'](function (err) {
        actions.dataSaveFailed(err);
    });
}

function removeItem(model) {
    actions.dataSave();
    resources.remove(model._id)
        .then(function (result) {
            actions.dataRemoveCompleted(result);
        })
        ['catch'](function (err) {
        actions.dataSaveFailed(err);
    });
}

function createNewNavlink(category, order) {
    return {
        text: null,
        url: null,
        category: category,
        disabled: false,
        visible: true,
        icon: null,
        order: order,
        newWindow: false,
        useClientRouter: true
    }
}

function getNextOrderToPush(data) {
    var result = 0;

    _.each(data, function (navlink) {
        if (navlink.order > result) {
            result = navlink.order;
        }
    });

    result = result + 1;
    return result;
}

module.exports = {
    actions: actions,
    store: store
};


