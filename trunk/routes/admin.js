/**
 * Created by Gordeev on 12.06.2014.
 */
var express = require('express'),
    router = express.Router(),
    preferredLocaleService = require('../service/preferredLocale');

/* GET admin page. */
router.get('/', function (req, res) {
    var locale = req.preferredLocale;

    if (!req.userHasAdminRights) {
        req.session.after = req.originalUrl;
        res.redirect('/auth/google');
        return;
    }

    res.render('admin/admin', {
        title: 'Admin app',
        user: req.user || {},
        admin: req.userHasAdminRights,
        preferredLocale: locale
    });
});

module.exports = router;