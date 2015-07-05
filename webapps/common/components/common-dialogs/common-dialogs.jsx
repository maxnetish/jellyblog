var Q = require('q');
var React = require('react');
var Reflux = require('reflux');
var ClassSet = require('classnames');
var _ = require('lodash');

var componentFlux = require('./common-dialogs-flux');

var ModalComponent = require('../modal/modal.jsx');

function renderDialogConfirm(id, data, handleClose) {
    return <ModalComponent visible={true} key={id}>
        <div className="modal-header">
            <button type="button"
                    className="close"
                    onClick={handleClose.bind(null, {id: id, result: 'reject'})}
                    aria-label="Close">
                <span>&times;</span>
            </button>
            <h4 className="modal-title">{data.title || 'Confirm dialog'}</h4>
        </div>
        <div className="modal-body">
            {data.message}
        </div>
        <div className="modal-footer">
            <button type="button"
                    className="btn btn-primary"
                    onClick={handleClose.bind(null, {id: id, result: 'resolve'})}>
                <i className="glyphicon glyphicon-ok"></i>
                &nbsp;Yes
            </button>
            <button type="button"
                    className="btn btn-default"
                    onClick={handleClose.bind(null, {id: id, result: 'reject'})}>
                No
            </button>
        </div>
    </ModalComponent>;
}

function renderDialog(id, data, type, handleClose) {
    switch (type) {
        case 'confirm':
            return renderDialogConfirm(id, data, handleClose);
        default:
            return null;
    }
}

var CommonDialogsComponent = React.createClass({
    mixins: [Reflux.ListenerMixin],
    getInitialState: function () {
        return {
            dialogs: []
        };
    },
    render: function () {
        var renderedDialogs = _.map(this.state.dialogs, function (dialogModel) {
            return renderDialog(dialogModel.id, dialogModel.data, dialogModel.type, this.handleClose);
        }, this);
        return <section>
            {renderedDialogs}
        </section>;
    },
    componentDidMount: function () {
        this.listenTo(componentFlux.store, this.onStoreChanged);
    },
    onStoreChanged: function (storeData) {
        this.setState({
            dialogs: _.cloneDeep(storeData)
        });
    },

    handleClose: function(data, event){
        var payload = {
            id: data.id
        };

        if(data.result === 'reject'){
            payload.error = 'close';
        }

        componentFlux.actions.dismissDialog(payload);
    }
});

module.exports = CommonDialogsComponent;

