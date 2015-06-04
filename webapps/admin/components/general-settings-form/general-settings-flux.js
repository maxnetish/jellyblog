var Reflux = require('reflux');
var _ = require('lodash');
var resources = require('./general-settings-resources');

var actions = Reflux.createActions([
    'valueChanged',
    'dataGet',
    'dataGetCompleted',
    'dataGetFailed',
    'dataSave',
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
        this.trigger(this.getViewModel());
        saveDataDebounce(this.data);
    },
    onComponentMounted: function () {
        if (_.isEmpty(this.data)) {
            getData();
        } else {
            this.trigger(this.getViewModel());
        }
    },
    onDataGet: function () {
        this.loading = true;
        this.trigger(this.getViewModel());
    },
    onDataGetCompleted: function (gettedData) {
        this.data = _.cloneDeep(gettedData);
        this.loading = false;
        this.prisine = true;
        this.trigger(this.getViewModel());
    },
    onDataGetFailed: function (err) {
        this.loading = false;
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
        this.prisine = true;
        this.trigger(this.getViewModel());
    },
    onDataSaveFailed: function (err) {
        this.saving = false;
        console.log(err);
        this.trigger(this.getViewModel());
    },

    getViewModel: function () {
        return {
            data: this.data,
            pristine: this.pristine,
            loading: this.loading,
            saving: this.saving
        };
    },

    data: {},
    pristine: true,
    loading: false,
    saving: false
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
