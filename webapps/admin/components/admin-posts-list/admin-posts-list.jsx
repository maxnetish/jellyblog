var React = require('react/addons');
var Router = require('react-router');
var Reflux = require('reflux');
var ClassSet = require('classnames');
var _ = require('lodash');

var componentFlux = require('./admin-posts-list-flux');

var AdminPostsList = React.createClass({
    mixins: [Reflux.ListenerMixin],
    getInitialState: function () {
        var vm = _.cloneDeep(componentFlux.store.getViewModel());
        return vm;
    },
    render: function(){
        return <section className="admin-posts-list">
            <pre>{JSON.stringify(this.props.query, null, '\t')}</pre>
        </section>
    },
    componentDidMount: function () {
        componentFlux.actions.componentMounted(this.props.query);
        this.listenTo(componentFlux.store, this.onStoreChanged);
    },

    onStoreChanged: function(newViewModel){
        this.setState(newViewModel);
    }
});

module.exports = AdminPostsList;