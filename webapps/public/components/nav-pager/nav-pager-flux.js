var Reflux = require('reflux');
var _ = require('lodash');

var actionSyncOptions = {sync: true};
var actionAsyncOptions = {sync: false};

var actions = Reflux.createActions({
    'setInitialData': actionSyncOptions,
    'componentMounted': actionAsyncOptions,
    'paginationContentChanged': actionSyncOptions
});

var store = Reflux.createStore({
    listenables: actions,

    onSetInitialData: function(data){
        data = data || {};
        this.previousUrl = data.previousUrl || null;
        this.nextUrl = data.nextUrl || null;
    },
    onComponentMounted: function () {

    },
    onPaginationContentChanged: function () {

    },
    previousUrl: null,
    nextUrl: null,
    loading: false,
    error: null,
    getViewModel: function () {
        return {
            previousUrl: this.previousUrl,
            nextUrl: this.nextUrl,
            loading: this.loading,
            error: this.error
        };
    }
});

module.exports = {
    actions: actions,
    store: store
};
