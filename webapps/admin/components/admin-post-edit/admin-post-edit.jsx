var React = require('react/addons');
var Router = require('react-router');
var Reflux = require('reflux');
var ClassSet = require('classnames');
var _ = require('lodash');
var moment = require('moment');

//var componentFlux = require('./admin-posts-list-flux');

var AdminPostEdit = React.createClass({
    mixins: [Reflux.ListenerMixin],
    getDefaultProps: function () {
        return {
            postId: null
        };
    },
    getInitialState: function () {
        //var vm = _.cloneDeep(componentFlux.store.getViewModel());
        //return vm;
        return {};
    },
    render: function () {
        return <section className="admin-post-edit">
            <div className="panel panel-default">
                <div className="panel-heading">
                    Post edit here
                </div>
                <div className="panel-body">
                    Edit {this.props.postId}
                </div>
            </div>
        </section>;
    },
    componentDidMount: function () {
        //componentFlux.actions.componentMounted(this.props.query);
        //this.listenTo(componentFlux.store, this.onStoreChanged);
    },
    componentWillReceiveProps: function (nextProps) {
        //componentFlux.actions.queryChanged(nextProps.query);
    },

    onStoreChanged: function (newViewModel) {
        this.setState(newViewModel);
    }
});

module.exports = AdminPostEdit;