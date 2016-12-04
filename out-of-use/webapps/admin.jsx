var Q = require('q');
var _ = require('lodash');

var React = require('react');
var ReactDom = require('react-dom');
var ReactRouter = require('react-router');
var createHistory = require('history/lib/createBrowserHistory');
var useBasename = require('history/lib/useBasename');
var Router = ReactRouter.Router;
var Route = ReactRouter.Route;
var IndexRoute  = ReactRouter.IndexRoute ;

var adminRoutes = require('./admin/routes');
var AdminHome = adminRoutes.AdminHome;
var AdminPageNotFound = adminRoutes.PageNotFound;

var App = require('./admin/components/admin-app/admin-app.jsx');

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

function initInBrowser(rootElementId) {
    var rootElement = document.getElementById(rootElementId);
    var injectedFromBackend = (window && window.jb__injected) || {};
    var dataToPassAsProp = {
        // state: state,
        injectedFromBackend: injectedFromBackend
    };

    // setup router history
    // with query support
    var history = ReactRouter.useRouterHistory(createHistory)({
        basename: '/admin'
    });

    // setup moment locale
    var mom = require('moment');
    var loc = require('moment/min/locales');
    var momentLocalizer = require('react-widgets-moment-localizer');
    mom.locale(injectedFromBackend.preferredLocale || 'en');

    // setup react-widgets
    require('react-widgets/lib/configure').setDateLocalizer(momentLocalizer(mom));

    // and run react
    ReactDom.render(<Router data={dataToPassAsProp} history={history}>{routes}</Router>, rootElement);
}

// run up in browser here:
initInBrowser('react-wrapper');

module.exports = {
    /*doBackendRender: doBackendRender,*/
    // routeStore: routeStore
};
