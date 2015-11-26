var Q = require('q');
var _ = require('lodash');

var React = require('react');
var ReactRouter = require('react-router');
var createHistory = require('history/lib/createBrowserHistory');
var useBasename = require('history/lib/useBasename');
var Router = ReactRouter.Router;
var Route = ReactRouter.Route;
var NotFoundRoute = Router.NotFoundRoute;
var IndexRoute  = ReactRouter.IndexRoute ;

var Reflux = require('reflux');

var Navmenu = require('./admin/components/navmenu/navmenu.jsx');
var AuthRedirector = require('./admin/components/auth-redirector/auth-redirector.jsx');
var AdminViewWrapper = require('./admin/components/admin-view-wrapper/admin-view-wrapper.jsx');
var CommonDialogsComponent = require('./common/components/common-dialogs/common-dialogs.jsx');

var adminRoutes = require('./admin/routes');
var AdminHome = adminRoutes.AdminHome;
var AdminPageNotFound = adminRoutes.PageNotFound;

var App = React.createClass({
    render: function () {
        var injectedFromBackend = (window && window.jb__injected) || {};
        var isAdmin = !!(injectedFromBackend && injectedFromBackend.admin);

        return <div>
            <Navmenu />
            {isAdmin ?
                <AdminViewWrapper>{this.props.children}</AdminViewWrapper> :
                <AuthRedirector />
            }
            <CommonDialogsComponent />
        </div>;
    }
});

/**
 * /admin is 'root' path for app
 * lower routes has relative paths
 * @type {XML}
 */
var routes = (
    <Route component={App} path="/">
        <IndexRoute component={AdminHome}/>
        <Route path="navlinks" component={adminRoutes.Navlinks}/>
        <Route path="other" component={adminRoutes.AdminOther}/>
        <Route path="posts">
            <IndexRoute component={adminRoutes.Posts} />
            <Route path=":id/edit" component={adminRoutes.AdminOther} />
        </Route>
        <Route path="*" component={AdminPageNotFound}/>
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
    var injectedFromBackend = (window && window.jb__injected) || {};
    var dataToPassAsProp = {
        // state: state,
        injectedFromBackend: injectedFromBackend
    };

    // setup router history
    // with query support
    var history = useBasename(createHistory)({
        basename: '/admin'
    });

    // setup moment locale
    var mom = require('moment');
    var loc = require('moment/min/locales');
    var momentLocalizer = require('react-widgets-moment-localizer');
    mom.locale(injectedFromBackend.preferredLocale || 'en');

    // setup react-widgets
    require('react-widgets/lib/configure').setDateLocalizer(momentLocalizer(mom));

    React.render(<Router data={dataToPassAsProp} history={history}>{routes}</Router>, document.getElementById(rootElementId), function () {
        routeActions.stateChanged(null);
    });
    /*
    Router.run(routes, Router.HistoryLocation, function (Root, state) {
        // whenever the url changes, this callback is called again
        var injectedFromBackend = (window && window.jb__injected) || {};
        var dataToPassAsProp = {
            state: state,
            injectedFromBackend: injectedFromBackend
        };
        // setup moment locale
        //require('moment').locale(injectedFromBackend.preferredLocale || 'en');
        var mom = require('moment');
        var loc = require('moment/min/locales');
        var momentLocalizer = require('react-widgets-moment-localizer');

        mom.locale(injectedFromBackend.preferredLocale || 'en');

        require('react-widgets/lib/configure').setDateLocalizer(momentLocalizer(mom));

        //console.log(mom.locale());
        //console.log(mom.months());

        React.render(<Root data={dataToPassAsProp}/>, document.getElementById(rootElementId), function () {
            routeActions.stateChanged(state);
        });
    });
    */
}


/**
 *
 * @param requestUrl
 * @param buildViewModel function that should return viewMOdel or promise that will resolve to viewModel
 * @returns {Function|promiseViewModel|promisePublicPageVm|*|promise|f} promise which resolves to html string
 */
/*function doBackendRender(requestUrl, buildViewModel) {
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
}*/

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
    /*doBackendRender: doBackendRender,*/
    routeStore: routeStore
};
