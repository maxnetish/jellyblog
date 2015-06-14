var React = require('react/addons');
var Reflux = require('reflux');
var _ = require('lodash');
var ClassSet = require('classnames');
var componentFlux = require('./navlinks-editor-flux');

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
                    <span className="panel-title">Main menu links</span>
                </div>
                <div className="panel-body">
                </div>
            </div>
            <div className="panel panel-default">
                <div className="panel-heading">
                    <span className="panel-title">Footer links</span>
                </div>
                <div className="panel-body">
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