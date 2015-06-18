var React = require('react/addons');
var Reflux = require('reflux');
var _ = require('lodash');
var ClassSet = require('classnames');
var componentFlux = require('./navlinks-editor-flux');

var NavlinkEditModalDialog = require('../navlink-edit-modal-dialog/navlink-edit-modal-dialog.jsx');

function renderNavlink(navlinkModel, editHandler) {
    var iconClass = 'navlink-icon glyphicon ' + navlinkModel.icon;
    var linkClass = ClassSet({
        'navlink-ancor': true,
        'disabled': navlinkModel.disabled,
        'menu-preview-no-visible': !navlinkModel.visible
    });
    var linkTarget = navlinkModel.newWindow ? '_blank' : null;

    return <li className="list-group-item">
        <div className="row">
            <div className="col-md-8">
                <a className={linkClass}
                   target={linkTarget}
                   href={navlinkModel.url}>
                    {navlinkModel.icon ? <i className={iconClass}></i> : null}
                    <span className="navlink-text">{navlinkModel.text}</span>
                </a>
            </div>
            <div className="col-md-4 text-right">
                <div className="btn-group btn-group-xs" role="group">
                    <button type="button"
                            className="btn btn-xs btn-primary"
                            onClick={editHandler.bind(null, navlinkModel)}
                            title="Edit">
                        <i className="glyphicon glyphicon-edit"></i>
                        &nbsp;Edit
                    </button>
                    <button type="button" className="btn btn-xs btn-danger" title="Remove">
                        <i className="glyphicon glyphicon-remove"></i>
                    </button>
                </div>
            </div>
        </div>
    </li>;
}

function renderLinksByCategory(navlinks, category, editHandler) {
    var navlinksOfCategory = _.where(navlinks, {
        category: category
    });

    return <div>
        <h4>{category}</h4>
        <ul className="list-group">
            {_.map(navlinksOfCategory, function (navlink) {
                return renderNavlink(navlink, editHandler);
            }, this)}
        </ul>
    </div>;
}

var NavlinksEditor = React.createClass({
    mixins: [Reflux.ListenerMixin],
    getInitialState: function () {
        var vm = _.cloneDeep(componentFlux.store.getViewModel());
        return vm;
    },
    render: function () {
        return <section className="navlink-editor">
            navlinks-editor
            <div className="panel panel-default">
                <div className="panel-heading">
                    <span className="panel-title">Links</span>
                </div>
                <div className="panel-body">
                    <div className="row">
                        <div className="col-md-6">
                            {renderLinksByCategory(this.state.data, 'main', this.onEditButtonClick)}
                        </div>
                        <div className="col-md-6">
                            {renderLinksByCategory(this.state.data, 'footer', this.onEditButtonClick)}
                        </div>
                    </div>
                </div>
            </div>
            <NavlinkEditModalDialog ref="navlinkEditModalDialog"/>
        </section>;
    },
    componentDidMount: function () {
        componentFlux.actions.componentMounted();
        this.listenTo(componentFlux.store, this.onStoreChanged);
    },
    onStoreChanged: function (storeData) {
        this.setState(_.cloneDeep(storeData));
    },

    onEditButtonClick: function (navlinkModel, event) {
        this.refs.navlinkEditModalDialog.showDialog(navlinkModel)
            .then(function (result) {
                console.log(result);
            })
            ['catch'](function (err) {
                console.log(err);
            });
    }
});

module.exports = NavlinksEditor;