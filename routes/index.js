var express = require('express'),
    router = express.Router();
//indexVm = require('../service/vm/indexVm'),
//urlHelper = require('../service/urlHelper'),
//gAnalytics = require('../config').googleAnalytics || {};

//var RootReactComponent = require('../views/root/root.jsx');

var Q = require('q');
var _ = require('lodash');
var dataProvider = require('../service/dataProvider');


/* GET home page. */
router.get('*', function (req, res, next) {
    // use react-engine render

    var modelBuilder = [];

    var model = {
        developmentMode: !!req.query.debug || express().get('env') === 'development',
        admin: !!req.userHasAdminRights,
        user: req.user,
        preferredLocale: req.preferredLocale
    };

    modelBuilder.push(dataProvider.promiseNavlinkList()
            .then(function (navlinks) {
                return {
                    navlinks: navlinks
                };
            })
    );

    modelBuilder.push(dataProvider.promiseSettings()
            .then(function (settings) {
                return {
                    misc: settings
                };
            })
            .then(function (prevResult) {
                return dataProvider.promisePaginationPosts(req.query, req.preferredLocale, prevResult.misc.postsPerPage)
                    .then(function (posts) {
                        return _.assign(prevResult, {
                            posts: posts
                        });
                    });
            })
    );

    Q.all(modelBuilder)
        .then(function (result) {
            var collectedModel = _.reduce(result, function (accumulator, value) {
                return _.assign(accumulator, value);
            }, model);
            res.render(req.url, collectedModel);
            return result;
        })
        .then(null, next);

    //res.render(req.url, {
    //    title: 'Public app ' + req.url,
    //    developmentMode: !!req.query.debug || express().get('env') === 'development',
    //    admin: !!req.userHasAdminRights,
    //    user: req.user,
    //    preferredLocale: req.preferredLocale
    //});

    //res.render('../webapps/public-index.jade', {
    //    title: 'Public app ' + req.url,
    //    developmentMode: !!req.query.debug || express().get('env') === 'development',
    //    admin: !!req.userHasAdminRights,
    //    user: req.user,
    //    preferredLocale: req.preferredLocale,
    //    toInject: JSON.stringify({
    //        admin: !!req.userHasAdminRights,
    //        user: req.user,
    //        developmentMode: !!req.query.debug || express().get('env') === 'development',
    //        preferredLocale: req.preferredLocale
    //    })
    //});

    //res.send('OK');
    //RootReactComponent.doBackendRender(req, res);

    //Router.run()
    //
    ////res.render('index', {title: 'Cool title'});
    //var responseContent = RootComponent.doBackendRender({
    //    headers: req.headers,
    //    method: req.method,
    //    params: req.params,
    //    query: req.query,
    //    url: req.url,
    //    path: req.path
    //});
    //
    //res
    //    .set('Content-Type', 'text/html')
    //    .send(responseContent);

    //var preferredLocale = req.preferredLocale,
    //    skip = parseInt(req.query.skip, 10) || 0,
    //    tag = req.query.tag;
    //
    //indexVm.promise({
    //    preferredLocale: preferredLocale,
    //    skip: skip,
    //    user: req.user,
    //    admin: req.userHasAdminRights,
    //    url: req.originalUrl,
    //    tag: tag
    //})
    //    .then(function (vm) {
    //        vm.pageUrl = urlHelper.combine(urlHelper.hostUrl, req.originalUrl);
    //        vm.deviceMobile = !!req.detectUserAgent.mobile();
    //        vm.gaIdentificator = gAnalytics.identificator;
    //        res.render('public/index', vm);
    //        return vm;
    //    })
    //    .then(null, next);
});

//router.get('/demo', function (req, res, next) {
//    var preferredLocale = req.preferredLocale,
//        skip = parseInt(req.query.skip, 10) || 0;
//
//    indexVm.promise({
//        preferredLocale: preferredLocale,
//        skip: skip,
//        user: req.user,
//        admin: req.userHasAdminRights,
//        url: req.url
//    })
//        .then(function (vm) {
//            res.render('public/demo', vm);
//            return vm;
//        })
//        .then(null, next);
//});

module.exports = router;
