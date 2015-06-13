var Reflux = require('reflux');
var _ = require('lodash');

var actionSyncOptions = {sync: true};
var actionAsyncOptions = {sync: false};
var actions = Reflux.createActions({
    'valueChanged': actionSyncOptions,
    'componentMounted': actionAsyncOptions,
    'dataGet': actionSyncOptions,
    'dataGetCompleted': actionSyncOptions,
    'dataGetFailed': actionSyncOptions
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
         *      valid
         * }
         *
         */

        if (!(payload && payload.id && payload.key)) {
            return;
        }
        this.data[payload.id][payload.key] = payload.value;
        this.pristine = false;
        this.trigger(this.getViewModel());
        if (payload.valid) {
            saveDataDebounce(this.data);
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
        this.trigger(this.getViewModel());
    },
    onDataGetFailed: function(err){
        his.loading = false;
        this.error = err;
        this.trigger(this.getViewModel());
    },

    getViewModel: function () {

    },

    dataLoadOnce: false,
    data: {},
    pristine: true,
    loading: false,
    error: null

});

var saveDataDebounce = _.debounce(saveData, 10000);

function getData() {

}

function saveData(model) {

}


