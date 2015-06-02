var Q = require('q');
var _ = require('lodash');

var React = require('react/addons');
var Router = require('react-router');
var Route = Router.Route;
var RouteHandler = Router.RouteHandler;
var NotFoundRoute = Router.NotFoundRoute;
var DefaultRoute = Router.DefaultRoute;

var adminRoutes = require('./admin/routes');
var AdminHome = adminRoutes.AdminHome;
var AdminPageNotFound = adminRoutes.PageNotFound;

var App = React.createClass({
    render: function () {
        return <div>
            <RouteHandler />
            <label>Props:</label>
            <pre>{JSON.stringify(this.props, null, '\t')}</pre>
        </div>;
    }
});

var routes = (
    <Route handler={App} path="/admin">
        <DefaultRoute name="admin-home" handler={AdminHome}/>
        <Route name="admin-other" path="other" handler={AdminHome} />
        <NotFoundRoute handler={AdminPageNotFound}/>
    </Route>
);

function initInBrowser(rootElementId) {
    Router.run(routes, Router.HistoryLocation, function (Root, state) {
        console.log(state);
        // whenever the url changes, this callback is called again
        React.render(<Root data={state}/>, document.getElementById(rootElementId));
    });
}

/**
 *
 * @param requestUrl
 * @param buildViewModel function that should return viewMOdel or promise that will resolve to viewModel
 * @returns {Function|promiseViewModel|promisePublicPageVm|*|promise|f} promise which resolves to html string
 */
function doBackendRender(requestUrl, buildViewModel) {
    var dfr = Q.defer();
    Router.run(routes, requestUrl, function (Root, state) {
        var buildViewModelResult;
        console.log(state);
        if (_.isFunction(buildViewModel)) {
            buildViewModelResult = buildViewModel(state);
            if (buildViewModelResult.hasOwnProperty('then')) {
                buildViewModelResult.then(function (resolvedData) {
                    dfr.resolve(React.renderToString(<Root data={resolvedData}/>));
                    return resolvedData;
                });
            } else {
                dfr.resolve(React.renderToString(<Root data={buildViewModelResult}/>));
            }
        } else {
            dfr.resolve(React.renderToString(<Root data={state}/>));
        }
    });
    return dfr.promise;
}

function isRunInBrowser() {
    var isBrowser = !(typeof window === 'undefined');
    return isBrowser;
}

// run up in browser here:
if (isRunInBrowser()) {
    initInBrowser('react-wrapper');
}

module.exports = {
    doBackendRender: doBackendRender
};