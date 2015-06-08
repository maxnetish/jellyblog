var React = require('react/addons');
var Reflux = require('reflux');
var _ = require('lodash');
var ClassSet = require('classnames');
var componentFlux = require('./general-settings-flux');

var AvatarCreator = require('../avatar-creator/avatar-creator.jsx');

var defaultTextInputOpts = {
    dataObject: {},
    fieldName: 'fieldName',
    fieldTitle: void 0,
    required: false,
    placeholder: 'Enter value',
    pattern: void 0,
    validityObject: {},
    inputType: 'text',
    onChange: _.noop,
    fieldAddonText: null,
    maxLength: null
};

function getClassSetForInputParent(inputName, validityState, baseClass) {
    var classSetOptions = {
        'has-error': validityState.hasOwnProperty(inputName) && !validityState[inputName]
    };
    classSetOptions[baseClass] = true;
    return ClassSet(classSetOptions);
}
function renderTextInputField(opts) {
    /**
     * dataObject, fieldName, fieldTitle, required, placeholder, pattern, validityObject, inputType, onChange
     */
    opts = _.assign(_.clone(defaultTextInputOpts), opts);
    var kebabFieldName = _.kebabCase(opts.fieldName);
    var xMarkup = <div className="form-group">
        <label htmlFor={kebabFieldName} className="col-md-2 control-label">{opts.fieldTitle || opts.fieldName}</label>

        <div className={getClassSetForInputParent(opts.fieldName, opts.validityObject, 'col-md-10')}>
            <input type={opts.inputType}
                   name={opts.fieldName}
                   id={kebabFieldName}
                   className="form-control"
                   placeholder={opts.placeholder}
                   required={opts.required}
                   pattern={opts.pattern}
                   maxLength={opts.maxLength}
                   value={opts.dataObject[opts.fieldName]}
                   onChange={opts.onChange}/>
        </div>
    </div>;
    return xMarkup;
}

function renderTextAreaField(opts) {
    opts = _.assign(_.clone(defaultTextInputOpts), opts);
    var kebabFieldName = _.kebabCase(opts.fieldName);
    var xMarkup = <div className="form-group">
        <label htmlFor={kebabFieldName} className="col-md-2 control-label">{opts.fieldTitle || opts.fieldName}</label>

        <div className={getClassSetForInputParent(opts.fieldName, opts.validityObject, 'col-md-10')}>
            <textarea name={opts.fieldName}
                      id={kebabFieldName}
                      className="form-control"
                      rows="3"
                      maxLength={opts.maxLength}
                      placeholder={opts.placeholder}
                      required={opts.required}
                      value={opts.dataObject[opts.fieldName]}
                      onChange={opts.onChange}></textarea>
        </div>
    </div>;
    return xMarkup;
}

function renderTextInputWithAddon(opts) {
    opts = _.assign(_.clone(defaultTextInputOpts), opts);
    var kebabFieldName = _.kebabCase(opts.fieldName);
    var xMarkup = <div className="form-group">
        <label htmlFor={kebabFieldName} className="col-md-2 control-label">{opts.fieldTitle || opts.fieldName}</label>

        <div className="col-md-10">
            <div className={getClassSetForInputParent(opts.fieldName, opts.validityObject, 'input-group')}>
                <span className="input-group-addon" id={'input-addon-'+opts.fieldName}>{opts.fieldAddonText}</span>
                <input name={opts.fieldName}
                       type={opts.inputType}
                       id={kebabFieldName}
                       className="form-control"
                       aria-describedby={'input-addon-'+opts.fieldName}
                       placeholder={opts.placeholder}
                       required={opts.required}
                       pattern={opts.pattern}
                       maxLength={opts.maxLength}
                       value={opts.dataObject[opts.fieldName]}
                       onChange={opts.onChange}/>
            </div>
        </div>
    </div>;
    return xMarkup;
}

var GeneralSettingsForm = React.createClass({
    mixins: [Reflux.ListenerMixin],
    getInitialState: function () {
        var vm = _.cloneDeep(componentFlux.store.getViewModel());
        vm.validity = {};
        return vm;
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

        return <section className="general-settings-form">
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
                                        { renderTextInputField({
                                            dataObject: this.state.data,
                                            fieldName: 'siteTitle',
                                            fieldTitle: 'Site title',
                                            required: true,
                                            placeholder: 'Enter site title (required)',
                                            pattern: void 0,
                                            maxLength: 128,
                                            validityObject: this.state.validity,
                                            inputType: 'text',
                                            onChange: this.textFieldChanged
                                        }) }
                                        { renderTextInputField({
                                            dataObject: this.state.data,
                                            fieldName: 'authorDisplayName',
                                            fieldTitle: 'Author name',
                                            required: true,
                                            placeholder: 'Enter author display name (required)',
                                            pattern: void 0,
                                            maxLength: 64,
                                            validityObject: this.state.validity,
                                            inputType: 'text',
                                            onChange: this.textFieldChanged
                                        }) }
                                        { renderTextAreaField({
                                            dataObject: this.state.data,
                                            fieldName: 'authorDisplayBio',
                                            fieldTitle: 'Author bio',
                                            required: false,
                                            placeholder: 'Enter author display bio',
                                            pattern: void 0,
                                            maxLength: 512,
                                            validityObject: this.state.validity,
                                            onChange: this.textFieldChanged
                                        }) }
                                        { renderTextInputWithAddon({
                                            dataObject: this.state.data,
                                            fieldName: 'authorTwitterScreenName',
                                            fieldTitle: 'Twitter screen name',
                                            required: false,
                                            placeholder: 'Enter twitter screen name',
                                            pattern: '[a-zA-Z0-9]*',
                                            maxLength: 64,
                                            validityObject: this.state.validity,
                                            inputType: 'text',
                                            onChange: this.textFieldChanged,
                                            fieldAddonText: '@'
                                        }) }

                                        <div className="form-group">
                                            <label className="col-md-2 control-label">Avatar</label>

                                            <div className="col-md-10">
                                                <div className="media">
                                                    <div className="media-left">
                                                        <img src={this.state.data.authorAvatarUrl}
                                                             className="media-object"
                                                             style={{height:'150px',width:'150px'}}/>
                                                    </div>
                                                    <div className="media-body">
                                                        <a href="javascript:void 0"
                                                           className="create-avatar-button"
                                                           onClick={this.onCreateNewAvatarButtonClick}>
                                                            <i className="caret caret-creator-toggle"></i>
                                                            <span>{this.state.avatarCreatorVisible ? 'Cancel' : 'Create new avatar'}</span>
                                                        </a>
                                                        {this.state.avatarCreatorVisible ?
                                                            <a href="javascript:void 0"
                                                               onClick={this.onApplyNewAvatarButtonClick}>
                                                                Apply new avatar
                                                            </a> :
                                                            null}
                                                        {this.state.avatarCreatorVisible ?
                                                            <div>
                                                                <AvatarCreator ref="avatarCreator"/>
                                                            </div> :
                                                            null}
                                                    </div>
                                                </div>
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
        // We should check both field and overall form validity
        // field validity will be use for invalid field styling
        // and if form valid than we will save data

        var fieldValidity = {};
        var valid = e.target.checkValidity();
        var formValid = React.findDOMNode(this.refs.generalSettingsForm).checkValidity();
        var oldValue = this.state.data[e.target.name];

        fieldValidity[e.target.name] = valid;

        this.setState({
            validity: _.assign(this.state.validity, fieldValidity)
        });


        if (oldValue !== e.target.value) {
            componentFlux.actions.valueChanged({
                key: e.target.name,
                value: e.target.value,
                valid: formValid
            })
        }
    },
    onErrorLinkClick: function (e) {
        this.setState({
            showErrorDetails: !this.state.showErrorDetails
        });
    },
    onApplyNewAvatarButtonClick: function (e) {
        var creator = this.refs.avatarCreator;
        var imageDataUrl = creator.getImageDataUrl();
        this.setState({
            //createdAvatarUrl: imageDataUrl,
            avatarCreatorVisible: false
        });
        componentFlux.actions.applyNewAvatar(imageDataUrl);
    },
    onCreateNewAvatarButtonClick: function (e) {
        this.setState({
            avatarCreatorVisible: !this.state.avatarCreatorVisible
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