var Reflux = require('reflux');
var _ = require('lodash');
var Q = require('q');

var actionSyncOptions = {sync: true};
var actionAsyncOptions = {sync: false};
var actions = Reflux.createActions({
    'showConfirm': actionAsyncOptions,
    'dismissDialog': actionAsyncOptions
});

var store = Reflux.createStore({
    listenables: actions,

    onShowConfirm: function (payload) {
        /**
         * {data, deferred}
         */
        this._dialogs.push({
            id: _.uniqueId('dialog-'),
            data: payload.data,
            deferred: payload.deferred,
            type: 'confirm'
        });
        this.trigger(this.getViewModel());
    },
    onDismissDialog: function (payload) {
        /**
         * {id, result, error}
         */
        var targetDialogModel = _.find(this._dialogs, function (m) {
            return m.id === payload.id;
        }, this);
        if (!targetDialogModel) {
            return;
        }

        if (payload.error) {
            targetDialogModel.deferred.reject(payload.error);
        } else {
            targetDialogModel.deferred.resolve(payload.result);
        }

        _.remove(this._dialogs, function (m) {
            return m.id === payload.id;
        });

        this.trigger(this.getViewModel());
    },

    getViewModel: function () {
        return this._dialogs;
    },

    _dialogs: []
});

module.exports = {
    actions: actions,
    store: store
};
