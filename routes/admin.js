/**
 * Created by Gordeev on 12.06.2014.
 */
var express = require('express'),
    router = express.Router();
//preferredLocaleService = require('../service/preferredLocale'),
//CommonVm = require('../service/vm/commonVm');

var reactAdminApp = require('../webapps/admin.jsx');

/* GET admin page. */
router.get('*', function (req, res) {

    reactAdminApp.doBackendRender(req.originalUrl)
        .then(function (html) {
            res.render('../webapps/admin-index', {
                title: 'Admin app',
                prerendered: html,
                developmentMode: !!req.query.debug || express().get('env') === 'development'
            });
        });

    //var locale = req.preferredLocale,
    //    vm;
    //
    ///*
    //if (!req.userHasAdminRights) {
    //    req.session.after = req.originalUrl;
    //    res.redirect('/auth/google');
    //    return;
    //}
    //*/
    //
    //vm = new CommonVm({
    //    pageTitle: 'Admin app',
    //    user: req.user || {},
    //    admin: req.userHasAdminRights,
    //    preferredLocale: locale
    //});
    //
    //res.render('admin/admin', vm);
});

module.exports = router;