var Q = require('q');
var _ = require('lodash');

var React = require('react/addons');
var Router = require('react-router');
var Route = Router.Route;
var RouteHandler = Router.RouteHandler;
var NotFoundRoute = Router.NotFoundRoute;
var DefaultRoute = Router.DefaultRoute;

var Reflux = require('reflux');

var Navmenu = require('./admin/components/navmenu/navmenu.jsx');
var AuthRedirector = require('./admin/components/auth-redirector/auth-redirector.jsx');
var AdminViewWrapper = require('./admin/components/admin-view-wrapper/admin-view-wrapper.jsx');

var adminRoutes = require('./admin/routes');
var AdminHome = adminRoutes.AdminHome;
var AdminPageNotFound = adminRoutes.PageNotFound;

var injectedFromBackend = (window && window.jb__injected) || {};

var App = React.createClass({
    render: function () {
        var isAdmin = !!(this.props.data && this.props.data.injectedFromBackend && this.props.data.injectedFromBackend.admin);

        return <div>
            <Navmenu />
            {isAdmin ? <AdminViewWrapper><RouteHandler data={this.props.data}/></AdminViewWrapper> : <AuthRedirector />}
            {/*
             <pre>{JSON.stringify(this.props)}</pre>
             <pre>{JSON.stringify(this.state)}</pre>
             */}
        </div>;
    }
});

/**
 * /admin is 'root' path for app
 * lower routes has relative paths
 * @type {XML}
 */
var routes = (
    <Route handler={App} path="/admin">
        <DefaultRoute name="admin-home" handler={AdminHome}/>
        <Route name="admin-navlinks" path="navlinks" handler={adminRoutes.Navlinks}/>
        <Route name="admin-other" path="other" handler={adminRoutes.AdminOther}/>
        <NotFoundRoute handler={AdminPageNotFound}/>
    </Route>
);

var routeActions = Reflux.createActions([
    'stateChanged'
]);

var routeStore = Reflux.createStore({
    listenables: routeActions,
    onStateChanged: function (state) {
        var oldState = this.state;
        this.state = state;
        this.trigger({
            oldState: oldState,
            newState: state
        });
    },
    state: null
});

function initInBrowser(rootElementId) {
    Router.run(routes, Router.HistoryLocation, function (Root, state) {
        // whenever the url changes, this callback is called again
        var dataToPassAsProp = {
            state: state,
            injectedFromBackend: injectedFromBackend
        };
        React.render(<Root data={dataToPassAsProp}/>, document.getElementById(rootElementId), function () {
            routeActions.stateChanged(state);
        });
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
    return !(typeof window === 'undefined');
}

routeStore.listen(function () {
    console.log('route store fires event:');
    console.log(arguments);
});

// run up in browser here:
if (isRunInBrowser()) {
    initInBrowser('react-wrapper');
}

module.exports = {
    doBackendRender: doBackendRender,
    routeStore: routeStore
};