var React = require('react/addons');
var Reflux = require('reflux');
var _ = require('lodash');
var ClassSet = require('classnames');
var componentFlux = require('./navlinks-editor-flux');

function renderNavlink(navlinkModel) {
    return <tbody>
    <tr>
        <td>
            <div>
                <input type="text"
                       value={navlinkModel.text}
                       required
                       className="form-control"/>
            </div>
        </td>
        <td>
            <div>{navlinkModel.icon}</div>
        </td>
        <td>
            <div><input type="checkbox" value={navlinkModel.disabled}/></div>
        </td>
        <td>
            <div><input type="checkbox" value={navlinkModel.visible}/></div>
        </td>
        <td>
            <div><input type="checkbox" value={navlinkModel.newWindow}/></div>
        </td>
        <td>
            <div><input type="checkbox" value={navlinkModel.useClientRouter}/></div>
        </td>
    </tr>
    <tr>
        <td colSpan="6">
            <div>
                <input type="url"
                       value={navlinkModel.url}
                       required
                       className="form-control"/>
            </div>
        </td>
    </tr>
    </tbody>;
}

function renderTableByCategory(navlinks, category) {
    var navlinksOfCategory = _.where(navlinks, {
        category: category
    });

    return <div ckassName="table-responsive">
        <table className="table">
            <caption>{category}</caption>
            <thead>
            <tr>
                <th>Text/URL</th>
                <th>Icon</th>
                <th>Disabled</th>
                <th>Visible</th>
                <th>New window</th>
                <th>Use client router</th>
            </tr>
            </thead>
            {_.map(navlinksOfCategory, function (navlink) {
                return renderNavlink(navlink);
            })}
        </table>
    </div>;
}

var NavlinksEditor = React.createClass({
    mixins: [Reflux.ListenerMixin],
    getInitialState: function () {
        var vm = _.cloneDeep(componentFlux.store.getViewModel());
        return vm;
    },
    render: function () {
        return <section>
            navlinks-editor
            <div className="panel panel-default">
                <div className="panel-heading">
                    <span className="panel-title">Links</span>
                </div>
                <div className="panel-body">
                    {renderTableByCategory(this.state.data, 'main')}
                </div>
            </div>
        </section>;
    },
    componentDidMount: function () {
        componentFlux.actions.componentMounted();
        this.listenTo(componentFlux.store, this.onStoreChanged);
    },
    onStoreChanged: function (storeData) {
        this.setState(_.cloneDeep(storeData));
    }
});

module.exports = NavlinksEditor;