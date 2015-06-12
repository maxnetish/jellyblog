var Reflux = require('reflux');
var _ = require('lodash');

var actionSyncOptions = {sync: true};
var actionAsyncOptions = {sync: false};
var actions = Reflux.createActions({
    'valueChanged': actionSyncOptions,
    'componentMounted': actionAsyncOptions
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

    getViewModel: function(){

    },

    data: {},
    pristine: true

});

var saveDataDebounce = _.debounce(saveData, 10000);

function getData() {

}

function saveData(model) {

}


