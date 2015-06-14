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
    onItemAdd: function (category) {
        var newNavlink = createNewNavlink(category, getNextOrderToPush(this.data));

        this.pristine = false;
        this.itemsToPendingUpdate.push(newNavlink._id);
        this.data[newNavlink._id] = newNavlink;
        this.trigger(this.getViewModel());
        // new empty navlink is not valid, so...
        saveDataDebounce.cancel();
    },
    onItemRemove: function (payload) {
        var navlink = payload.value;
        var valid = payload.valid;
        this.prisine = false;
        delete this.data[navlink._id];
        if (!_.startsWith(navlink._id, newNavlinkIdPrefix)) {
            this.itemsToPendingRemove.push(navlink._id);
        }
        this.trigger(this.getViewModel());
        if (valid) {
            saveDataDebounce(this.data, this.itemsToPendingUpdate, this.itemsToPendingRemove);
        } else {
            saveDataDebounce.cancel();
        }
    },
    onDataSave: function () {
        this.loading = true;
        this.trigger(this.getViewModel());
    },
    onDataSaveCompleted: function (payload) {
        this.loading = false;
        this.pristine = true;
        this.error = null;
        this.itemsToPendingRemove.length = 0;
        this.itemsToPendingUpdate.length = 0;
        // TODO update existing items
        this.data = _.omit(this.data, function (existingNavlink) {
            return _.startsWith(existingNavlink._id, newNavlinkIdPrefix);
        });
        _.each(payload, function (updatedNavlink) {
            if (updatedNavlink._id) {
                this.data[updatedNavlink._id] = updatedNavlink;
            }
        }, this);
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

    dataLoadOnce: false,
    itemsToPendingRemove: [],
    itemsToPendingUpdate: [],

    data: {},
    pristine: true,
    loading: false,
    error: null

});

var saveDataDebounce = _.debounce(saveData, 10000);

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

function saveData(model, itemsToPendingUpdate, itemsToPendingRemove) {
    var pendingOperations = [];

    _.each(itemsToPendingRemove, function (idToRemove) {
        if (!model.hasOwnProperty(idToRemove)) {
            return;
        }
        pendingOperations.push(resources.remove(idToRemove))
            .then(function (result) {
                return null;
            });
    });
    _.each(itemsToPendingUpdate, function (idToUpdate) {
        if (!model.hasOwnProperty(idToUpdate)) {
            return;
        }
        if (_.startsWith(idToUpdate, newNavlinkIdPrefix)) {
            pendingOperations.push(resources.create(model[idToUpdate]));
        } else {
            pendingOperations.push(resources.put(model[idToUpdate]));
        }
    });

    actions.dataSave();

    return Q.all(pendingOperations)
        .then(function (updateResult) {
            actions.dataSaveCompleted(updateResult);
            return updateResult;
        })
        ['catch'](function (err) {
        actions.dataSaveFailed(err);
    });
}

function idForNewItem() {
    return _.uniqueId(newNavlinkIdPrefix);
}

function createNewNavlink(category, order) {
    return {
        _id: idForNewItem(),
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


