var React = require('react/addons');
var Reflux = require('reflux');
var _ = require('lodash');
var ClassSet = require('classnames');
var componentFlux = require('./navlinks-editor-flux');

var NavlinkEditModalDialog = require('../navlink-edit-modal-dialog/navlink-edit-modal-dialog.jsx');
var commonDialogs = require('../../../common/components/common-dialogs/common-dialogs-service');

function renderNavlink(navlinkModel, editHandler, removeHandler) {
    var iconClass = 'navlink-icon glyphicon ' + navlinkModel.icon;
    var linkClass = ClassSet({
        'navlink-ancor': true,
        'disabled': navlinkModel.disabled,
        'menu-preview-no-visible': !navlinkModel.visible
    });
    var linkTarget = navlinkModel.newWindow ? '_blank' : null;

    return <li className="list-group-item" key={navlinkModel._id}>
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
                    <button type="button"
                            className="btn btn-xs btn-danger"
                            onClick={removeHandler.bind(null, navlinkModel)}
                            title="Remove">
                        <i className="glyphicon glyphicon-remove"></i>
                    </button>
                </div>
            </div>
        </div>
    </li>;
}

function renderLinksByCategory(navlinks, category, editHandler, removeHandler) {
    var navlinksOfCategory = _.where(navlinks, {
        category: category
    });

    return <div>
        <h4>{category}</h4>
        <ul className="list-group">
            {_.map(navlinksOfCategory, function (navlink) {
                return renderNavlink(navlink, editHandler, removeHandler);
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
            <div className="panel panel-default">
                <div className="panel-heading">
                    <span className="panel-title">Links</span>
                </div>
                <div className="panel-body">
                    <div className="row">
                        <div className="col-md-6">
                            {renderLinksByCategory(this.state.data, 'main', this.handleEditItem, this.handleRemoveItem)}
                            <div className="text-right">
                                <button type="button"
                                        onClick={this.handleAddItem.bind(null, 'main')}
                                        className="btn btn-success">
                                    <i className="glyphicon glyphicon-plus"></i>
                                    &nbsp;Add main menu item
                                </button>
                            </div>
                        </div>
                        <div className="col-md-6">
                            {renderLinksByCategory(this.state.data, 'footer', this.handleEditItem, this.handleRemoveItem)}
                            <div className="text-right">
                                <button type="button"
                                        onClick={this.handleAddItem.bind(null, 'footer')}
                                        className="btn btn-success">
                                    <i className="glyphicon glyphicon-plus"></i>
                                    &nbsp;Add footer link
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="panel-footer">
                    <div className="row">
                        <div className="col-md-12">

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

    handleRemoveItem: function (navlinkModel, event) {
        commonDialogs.confirm({
            title: 'Remove menu item',
            message: 'Remove menu item "' + navlinkModel.text + '" forever?'
        }).then(function () {
            componentFlux.actions.itemRemove({
                value: _.cloneDeep(navlinkModel)
            });
        })
    },
    handleEditItem: function (navlinkModel, event) {
        this.refs.navlinkEditModalDialog.showDialog(navlinkModel)
            .then(function (result) {
                componentFlux.actions.itemUpdate({
                    value: _.cloneDeep(result)
                });
            })
            ['catch'](function (err) {
            console.log(err);
        });
    },
    handleAddItem: function (category, event) {
        var navlinkModel = componentFlux.store.getNewNavlinkModel(category);
        this.refs.navlinkEditModalDialog.showDialog(navlinkModel)
            .then(function (result) {
                componentFlux.actions.itemAdd({
                    value: _.cloneDeep(result)
                });
            })
            ['catch'](function (err) {
            console.log(err);
        });
    }
});

module.exports = NavlinksEditor;