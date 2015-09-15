var React = require('react');
var Router = require('react-router');
var Reflux = require('reflux');
// var _ = require('lodash');

var NavPager = require('../../components/nav-pager/nav-pager.jsx');

var routeFlux = require('./home-flux');


var PublicHome = React.createClass({
    mixins: [Reflux.ListenerMixin],
    getInitialState: function () {
        var viewmodel = routeFlux.store.getViewModel();
        return {
            posts: viewmodel.posts,
            pager: viewmodel.pager
        };
    },
    render: function render() {
        console.log(this.props.query);
        return (
            <div>
                <h2>Public Home</h2>
                <NavPager {...this.state.pager}/>
                <Router.Link to="public-post" params={{postId: 'whatever'}}>
                    Post
                </Router.Link>
                <Router.Link to="public-tag" params={{tagId: 'whatever-tag'}}>
                    Tag
                </Router.Link>
                <label>Props of Home:</label>
                <pre>{JSON.stringify(this.props.query)}</pre>
                <pre>{JSON.stringify(this.state.posts)}</pre>
            </div>
        );
    },
    componentWillMount: function () {
        console.log('PublicHome component will mount handler');
        // var request = require('superagent');
        //
        // request
        //     .get('/api/posts')
        //     .end(function (err, response) {
        //         console.log('retrieve posts: '+response.body.length);
        //     });

    },
    componentDidMount: function () {
        routeFlux.actions.componentMounted();
        this.listenTo(routeFlux.store, this.onStoreChanged);
    },
    componentWillReceiveProps: function (nextProps) {
        if (nextProps.query !== this.props.query) {
            routeFlux.actions.queryChanged(nextProps.query);
        }
    },
    onStoreChanged: function (viewmodel) {
        this.setState({
            posts: viewmodel.posts,
            pager: viewmodel.pager
        });
    }
});

module.exports = PublicHome;
