var Q = require('q');
var React = require('react/addons');
var ClassSet = require('classnames');
var _ = require('lodash');

var ModalComponent = require('../../../common/components/modal/modal.jsx');

function resolveDialog(dialog, resolveData) {
    if (!dialog.state.visible) {
        return;
    }
    dialog._dfr.resolve(resolveData);
    dialog.setState({
        visible: false
    });
}

function rejectDialog(dialog, reason) {
    if (!dialog.state.visible) {
        return;
    }
    reason = reason || 'close';
    dialog._dfr.reject(reason);
    dialog.setState({
        visible: false
    });
}

var NavlinkModalEditor = React.createClass({
    getInitialState: function () {
        return {
            visible: false,
            data: {}
        };
    },
    render: function () {
        console.log('render navlink modal, state.data:');
        console.log(this.state);
        return <ModalComponent visible={this.state.visible}>
            {this.state.visible ? <div>
                <div className="modal-header">
                    <button type="button"
                            className="close"
                            onClick={this.onModalCloseClick}
                            aria-label="Close">
                        <span>&times;</span>
                    </button>
                    <h4 className="modal-title">Modal title here</h4>
                </div>
                <div className="modal-body">
                    <div>{this.state.data.text}</div>
                    <form>
                        <div className="form-horizontal">
                            <div className="form-group">
                                <label htmlFor="link-text" className="col-md-4 control-label">Text</label>

                                <div className="col-md-8">
                                    <input type="text"
                                           name="text"
                                           id="link-text"
                                           className="form-control"
                                           placeholder="Label text"
                                           required
                                           maxLength="32"
                                           value={this.state.data.text}
                                           onChange={this.onFieldChange}/>
                                </div>
                            </div>
                            <div className="form-group">
                                <label htmlFor="link-url" className="col-md-4 control-label">Url</label>

                                <div className="col-md-8">
                                    <input type="url"
                                           name="url"
                                           id="link-url"
                                           className="form-control"
                                           placeholder="Link url"
                                           required
                                           maxLength="1024"
                                           value={this.state.data.url}
                                           onChange={this.onFieldChange}/>
                                </div>
                            </div>
                        </div>
                    </form>
                </div>
                <div className="modal-footer">
                    <button type="button" className="btn btn-default" onClick={this.onModalCloseClick}>Cancel</button>
                    <button type="button" className="btn btn-primary" onClick={this.onModalOkClick}>OK</button>
                </div>
            </div> : null}
        </ModalComponent>;
    },

    onFieldChange: function (e) {
        var valid = e.target.checkValidity();
        //var formValid = React.findDOMNode(this.refs.generalSettingsForm).checkValidity();
        var newValue = e.target.value;
        var fieldName = e.target.name;
        var oldValue = this.state.data[fieldName];
        var dataState = {};
        //fieldValidity[e.target.name] = valid;

        if (oldValue === newValue) {
            return;
        }

        dataState[fieldName] = newValue;
        var newData = _.cloneDeep(this.state.data);
        newData[fieldName] = newValue;

        console.log('update state data:');
        console.log(dataState);
        this.setState({
            data: newData
        });
    },

    onModalCloseClick: function () {
        rejectDialog(this, 'cancel');
    },
    onModalOkClick: function () {
        resolveDialog(this, this.state.data);
    },

    showDialog: function (data) {
        if (this.state.visible) {
            return;
        }

        this._dfr = Q.defer();

        this.setState({
            visible: true,
            data: _.cloneDeep(data)
        });

        return this._dfr.promise;
    }

});

module.exports = NavlinkModalEditor;