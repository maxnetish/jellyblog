var Q = require('q');
var React = require('react/addons');
var ClassSet = require('classnames');
var _ = require('lodash');

var ModalComponent = require('../../../common/components/modal/modal.jsx');
var SuperSelect = require('react-super-select');

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

function getFormControlWrapperClassSet(validityObject, fieldName) {
    return ClassSet({
        'col-md-9': true,
        'has-error': validityObject.hasOwnProperty(fieldName) && !validityObject[fieldName]
    });
}

var NavlinkModalEditor = React.createClass({
    getInitialState: function () {
        return {
            visible: false,
            data: {},
            validity: {}
        };
    },
    render: function () {
        var testData = [
            {
                "id": "5507c0528152e61f3c348d56",
                "name": "elit laborum et",
                "size": "Large"
            },
            {
                "id": "5507c0526305bceb0c0e2c7a",
                "name": "dolor nulla velit",
                "size": "Medium"
            }
        ];

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
                    <form id="navlink-edit-form" onSubmit={this.onModalSubmit}>
                        <div className="form-horizontal">
                            <div className="form-group">
                                <label htmlFor="link-text" className="col-md-3 control-label">Text</label>

                                <div className={getFormControlWrapperClassSet(this.state.validity, 'text')}>
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
                                <label htmlFor="link-url" className="col-md-3 control-label">Url</label>

                                <div className={getFormControlWrapperClassSet(this.state.validity, 'url')}>
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
                            <div className="form-group">
                                <label htmlFor="link-disabled" className="col-md-3 control-label">Options</label>

                                <div className="col-md-9">
                                    <div className="checkbox">
                                        <label>
                                            <input type="checkbox"
                                                   name="disabled"
                                                   id="link-disabled"
                                                   checked={this.state.data.disabled}
                                                   onChange={this.onFieldChange}/>
                                            Disabled
                                        </label>
                                    </div>
                                    <div className="checkbox">
                                        <label>
                                            <input type="checkbox"
                                                   name="visible"
                                                   id="link-visible"
                                                   checked={this.state.data.visible}
                                                   onChange={this.onFieldChange}/>
                                            Visible
                                        </label>
                                    </div>
                                    <div className="checkbox">
                                        <label>
                                            <input type="checkbox"
                                                   name="useClientRouter"
                                                   id="link-useClientRouter"
                                                   checked={this.state.data.useClientRouter}
                                                   onChange={this.onFieldChange}/>
                                            Use client router
                                        </label>
                                    </div>
                                </div>
                            </div>
                            <div className="form-group">
                                <label htmlFor="link-url" className="col-md-3 control-label">Icon</label>

                                <div className={getFormControlWrapperClassSet(this.state.validity, 'url')}>
                                    <SuperSelect placeholder="Make a Selection"
                                                 dataSource={testData}
                                                 onChange={this.handleSelectIconChange}/>
                                </div>
                            </div>
                        </div>
                    </form>
                </div>
                <div className="modal-footer">
                    <button type="button" className="btn btn-default" onClick={this.onModalCloseClick}>Cancel</button>
                    <button type="submit" form="navlink-edit-form" className="btn btn-primary">OK</button>
                </div>
            </div> : null}
        </ModalComponent>;
    },

    onFieldChange: function (e) {
        var valid = e.target.checkValidity();
        //var formValid = React.findDOMNode(this.refs.generalSettingsForm).checkValidity();
        var newValue = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
        var fieldName = e.target.name;
        var oldValue = this.state.data[fieldName];
        var dataState = {};
        var fieldValidity = {};

        if (oldValue === newValue) {
            return;
        }

        fieldValidity[e.target.name] = valid;
        dataState[fieldName] = newValue;

        this.setState({
            data: _.assign(this.state.data, dataState),
            validity: _.assign(this.state.validity, fieldValidity)
        });
    },
    handleSelectIconChange: function () {
        console.log(arguments);
    },

    onModalCloseClick: function () {
        rejectDialog(this, 'cancel');
    },
    onModalSubmit: function (event) {
        event.preventDefault();
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