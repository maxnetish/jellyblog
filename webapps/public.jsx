var React = require('react');
var Q = require('q');
//var _ = require('lodash');

var Router = require('react-router');
//var Route = Router.Route;

var Views = require('./public/routes');
var CommonDialogsComponent = require('./common/components/common-dialogs/common-dialogs.jsx');

var refluxRouteUtils = require('./common/reflux-route-utils');

// we use q promises
require('reflux').setPromiseFactory(require('q').Promise);

var fluxes = [
    require('./public/routes/home/home-flux'),
    require('./public/routes/layout/layout-flux')
];

var App = React.createClass({
    componentWillMount: function () {
        // populate stores with data from props.preloadedData
        refluxRouteUtils.doStoresSetPreloadedData(fluxes, this.props.preloadedData);
    },
    render: function () {
        return <Views.Layout {...this.props}>
            <Router.RouteHandler {...this.props}/>
            <CommonDialogsComponent />
        </Views.Layout>;
    }
});

var routes = (
    <Router.Route handler={App} path="/">
        <Router.DefaultRoute name="public-home" handler={Views.PublicHome}/>
        <Router.Route name="public-post" path=":postId" handler={Views.PublicPost}/>
        <Router.Route name="public-tag" path="tag/:tagId" handler={Views.PublicPost}/>
        <Router.NotFoundRoute handler={Views.Public404}/>
    </Router.Route>
);

function serverRender(req, developmentMode) {
    var dfr = Q.defer();

    Router.run(routes, req.path, function (Root, state) {
        refluxRouteUtils.doStoresPreloadData(fluxes, req, state)
            .then(function (preloadModel) {
                preloadModel.developmentMode = !!developmentMode;
                var html = React.renderToString(<Root preloadedData={preloadModel}/>);
                dfr.resolve(html);
            })
            .then(null, dfr.reject);
    });

    return dfr.promise;
}

// run up in browser:
if (!(typeof window === 'undefined')) {
    (function clientRender() {
        Router.run(routes, Router.HistoryLocation, function (Root, state) {
            // pickup preloadModel from markup
            var preloadModel = __PRELOADED_DATA__ || {};
            console.log(preloadModel);
            React.render(<Root preloadedData={preloadModel} />, document, function () {

            });
        });
    })();
}


module.exports = {
    routes: routes,
    fluxes: fluxes,
    serverRender: serverRender
};
