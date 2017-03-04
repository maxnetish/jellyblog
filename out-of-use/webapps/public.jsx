var React = require('react');
// var Q = require('q');

var ReactRouter = require('react-router');

var Views = require('./public/routes');
var appLayoutComponent = require('./public/components/layout/layout.jsx');

var refluxRouteUtils = require('./common/reflux-route-utils');

// we use q promises
require('reflux').use(require('reflux-promise')(require('q').Promise));

var fluxes = [
    require('./public/routes/home/home-flux')
    //require('./public/routes/layout/layout-flux')
];

// var App = React.createClass({
//     componentWillMount: function () {
//         // populate stores with data from props.preloadedData
//         refluxRouteUtils.doStoresSetPreloadedData(fluxes, this.props.preloadedData);
//     },
//     render: function () {
//         return <Views.Layout {...this.props}>
//             <Router.RouteHandler {...this.props}/>
//             <CommonDialogsComponent />
//         </Views.Layout>;
//     }
// });

var routes = (
    <ReactRouter.Route component={appLayoutComponent} path="/">
        <ReactRouter.IndexRoute component={Views.PublicHome}/>
        <ReactRouter.Route path=":postId" component={Views.PublicPost}/>
        <ReactRouter.Route path="tag/:tagId" component={Views.PublicPost}/>
        <ReactRouter.Route path="*" component={Views.Public404}/>
    </ReactRouter.Route>
);

function serverRender(req, developmentMode) {

    return refluxRouteUtils.doStoresPreloadData(fluxes, req)
        .then(function (preloadModel) {
            preloadModel.developmentMode = !!developmentMode;
            return React.renderToString(<Root preloadedData={preloadModel}/>);
        });


    // Router.run(routes, req.path, function (Root, state) {
    //     refluxRouteUtils.doStoresPreloadData(fluxes, req, state)
    //         .then(function (preloadModel) {
    //             preloadModel.developmentMode = !!developmentMode;
    //             var html = React.renderToString(<Root preloadedData={preloadModel}/>);
    //             dfr.resolve(html);
    //         })
    //         .then(null, dfr.reject);
    // });

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