var Reflux = require('reflux');
var _ = require('lodash');

var actionSyncOptions = {sync: true};
var actionAsyncOptions = {sync: false};

var actions = Reflux.createActions({
    'setInitialData': actionSyncOptions,
    'componentMounted': actionAsyncOptions,
    'paginationUrlsChanged': actionSyncOptions
});

var store = Reflux.createStore({
    listenables: actions,

    onSetInitialData: function (data) {
        data = data || {};
        this.previous = data.previous || null;
        this.next = data.next || null;
    },
    onComponentMounted: function () {

    },
    onPaginationStateChanged: function (data) {
        data = data || {};
        this.previous = data.previous || null;
        this.next = data.next || null;
        this.trigger(this.getViewModel());
    },
    previous: null,
    next: null,
    loading: false,
    error: null,
    getViewModel: function () {
        return {
            previous: this.previous,
            next: this.next,
            loading: this.loading,
            error: this.error
        };
    }
});

module.exports = {
    actions: actions,
    store: store
};
