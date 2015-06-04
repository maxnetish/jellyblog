var Reflux = require('reflux');
var _ = require('lodash');
var resources = require('./general-settings-resources');

var actions = Reflux.createActions([
    'valueChanged',
    'dataGet',
    'dataGetCompleted',
    'dataGetFailed',
    'dataSaveCompleted',
    'dataSaveFailed',
    'componentMounted'
]);

var store = Reflux.createStore({
    listenables: actions,
    onValueChanged: function (payload) {
        if (!(payload && payload.key)) {
            return;
        }
        this.data[payload.key] = payload.value;
        this.pristine = false;
        this.trigger({
            data: this.data,
            pristine: this.pristine,
            loading: this.loading
        });
    },
    onComponentMounted: function () {
        if (_.isEmpty(this.data)) {
            getData();
        } else {
            this.trigger({
                data: this.data,
                pristine: this.pristine,
                loading: this.loading
            });
        }
    },
    onDataGet: function () {
        this.loading = true;
        this.trigger({
            data: this.data,
            pristine: this.pristine,
            loading: this.loading
        });
    },
    onDataGetCompleted: function (gettedData) {
        this.data = _.cloneDeep(gettedData);
        this.loading = false;
        this.prisine = true;
        this.trigger({
            data: this.data,
            pristine: this.pristine,
            loading: this.loading
        });
    },
    onDataGetFailed: function (err) {
        console.log(err);
    },

    data: {},
    pristine: true,
    loading: false
});

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

module.exports = {
    actions: actions,
    store: store
};
