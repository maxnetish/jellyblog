var React = require('react');
var Router = require('react-router');
var Reflux = require('reflux');
// var _ = require('lodash');

var routeFlux = require('./home-flux');


var PublicHome = React.createClass({
    mixins: [Reflux.ListenerMixin],
    getInitialState: function(){
        // little side effect here, none pure function
        //console.log('call routeFlux.actions.setInitialData');
        //routeFlux.actions.setInitialData({
        //    posts: this.props.posts
        //});
        var viewmodel = routeFlux.store.getViewModel();
        return {
            posts: viewmodel.posts
        };
    },
    render: function render() {
        return (
            <div>


                <h2>Public Home</h2>
                <Router.Link to="public-post" params={{postId: 'whatever'}}>
                    Post
                </Router.Link>
                <Router.Link to="public-tag" params={{tagId: 'whatever-tag'}}>
                    Tag
                </Router.Link>
                <label>Props of Home:</label>
                <pre>{JSON.stringify(this.props.params, null, '\t')}</pre>
                <pre>{JSON.stringify(this.props.query, null, '\t')}</pre>
                <pre>{JSON.stringify(this.state.posts, null, '\t')}</pre>
            </div>
        );
    },
    componentDidMount: function () {
        routeFlux.actions.componentMounted();
        this.listenTo(routeFlux.store, this.onStoreChanged);
    },
    onStoreChanged: function (viewmodel) {
        this.setState({
            posts: viewmodel.posts
        });
    }
});

module.exports = PublicHome;
