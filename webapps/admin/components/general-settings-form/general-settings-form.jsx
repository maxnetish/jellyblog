var React = require('react/addons');
var Reflux = require('reflux');
var _ = require('lodash');
var ClassSet = require('classnames');
var componentFlux = require('./general-settings-flux');

function getClassSetForInputParent(inputName, validityState, baseClass) {
    var classSetOptions = {
        'has-error': validityState.hasOwnProperty(inputName) && !validityState[inputName]
    };
    classSetOptions[baseClass] = true;
    return ClassSet(classSetOptions);
}

var GeneralSettingsForm = React.createClass({
    mixins: [Reflux.ListenerMixin],
    getInitialState: function () {
        return {
            data: {
                siteTitle: null
            },
            pristine: true,
            validity: {}
        };
    },
    render: function () {
        var saveButtonIconClass = ClassSet({
            'glyphicon glyphicon-saved': this.state.pristine,
            'glyphicon glyphicon-save': !this.state.pristine
        });

        var saveButtonText;
        if (this.state.saving) {
            saveButtonText = 'Saving';
        } else if (this.state.pristine) {
            saveButtonText = 'Saved';
        } else {
            saveButtonText = 'Save'
        }

        return <section>
            <div className="container-fluid">
                <div className="row">
                    <div className="col-md-offset-2 col-md-8">
                        <div className="panel panel-default">
                            <div className="panel-heading">
                                <span className="panel-title">General settings</span>
                            </div>
                            <div className="panel-body">
                                <form name="general-settings-form"
                                      id="general-settings-form"
                                      ref="generalSettingsForm"
                                      onSubmit={this.onSubmitForm}>
                                    <div className="form-horizontal">
                                        <div className="form-group">
                                            <label htmlFor="site-title" className="col-md-2 control-label">Site
                                                title</label>

                                            <div
                                                className={getClassSetForInputParent('siteTitle', this.state.validity, 'col-md-10')}>
                                                <input type="text"
                                                       name="siteTitle"
                                                       id="site-title"
                                                       className="form-control form-validation"
                                                       placeholder="Enter site title"
                                                       required
                                                       value={this.state.data.siteTitle}
                                                       onChange={this.textFieldChanged}/>
                                            </div>
                                        </div>
                                    </div>
                                </form>
                            </div>
                            <div className="panel-footer">
                                <div className="row">
                                    <div className="col-md-2">
                                        <button type="submit"
                                                form="general-settings-form"
                                                className="btn btn-primary"
                                                disabled={this.state.pristine || this.state.saving || this.state.loading}>
                                            <i className={saveButtonIconClass}></i>
                                            &nbsp;{saveButtonText}
                                        </button>
                                    </div>
                                    <div className="col-md-10">
                                        {this.state.error ? <div className="alert alert-danger" role="alert">
                                            Something wrong. Just got <a href="javascript:void 0;"
                                                                         className="alert-link"
                                                                         onClick={this.onErrorLinkClick}>error.</a>
                                            {this.state.showErrorDetails ?
                                                <pre>{JSON.stringify(this.state.error, null, '\t')}</pre> : null}
                                        </div> : null}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>;
    },
    componentDidMount: function () {
        componentFlux.actions.componentMounted();
        this.listenTo(componentFlux.store, this.onStoreChanged);
    },
    componentWillUnmount: function () {

    },
    textFieldChanged: function (e) {
        var fieldValidity = {};
        var valid = e.target.checkValidity();

        fieldValidity[e.target.name] = valid;

        this.setState({
            validity: _.assign(this.state.validity, fieldValidity)
        });

        componentFlux.actions.valueChanged({
            key: e.target.name,
            value: e.target.value,
            valid: valid
        })
    },
    onErrorLinkClick: function (e) {
        this.setState({
            showErrorDetails: !this.state.showErrorDetails
        });
    },
    onSubmitForm: function (e) {
        // We are use html5 form validation, so if some fields not valid than form will not submits
        e.preventDefault();
        componentFlux.actions.userForceSave();
    },
    onStoreChanged: function (storeData) {
        this.setState(_.cloneDeep(storeData));
    }
});

module.exports = GeneralSettingsForm;