var React = require('react');
var _ = require('lodash');

var Router = require('react-router');
var Route = Router.Route;

var Views = require('./public/routes');
var CommonDialogsComponent = require('./common/components/common-dialogs/common-dialogs.jsx');

var PublicOther = React.createClass({
    render: function render() {
        return (
            <div>
                <h2>Public Other</h2>
                <Router.Link to="public-home">
                    Home
                </Router.Link>
                <label>Props of other:</label>
                <pre>{JSON.stringify(_.omit(this.props, ['children']), null, '\t')}</pre>
            </div>
        );
    }
});

var App = React.createClass({
    render: function () {
        return <Views.Layout {...this.props}>
            <Router.RouteHandler {...this.props}/>
            <CommonDialogsComponent />
        </Views.Layout>;
    }
});

var routes = (
    <Route handler={App} path="/">
        <Router.DefaultRoute name="public-home" handler={Views.PublicHome}/>
        <Route name="public-other" path=":postId" handler={PublicOther}/>
        <Router.NotFoundRoute handler={Views.Public404}/>
    </Route>
);


// run up in browser:
if (!(typeof window === 'undefined')) {

    (function runApp() {
        var Client = require('react-engine/lib/client');
        var options = {
            routes: routes,
            // supply a function that can be called
            // to resolve the file that was rendered.
            viewResolver: function (viewName) {
                return require('./views/' + viewName);
            }
        };
        if (document.readyState == "loading") {
            document.addEventListener('DOMContentLoaded', function onLoad() {
                Client.boot(options);
            });
        } else {
            Client.boot(options);
        }
    })();

}

module.exports = {
    routes: routes
};