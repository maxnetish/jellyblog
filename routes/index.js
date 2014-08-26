var express = require('express'),
    router = express.Router(),
    indexVm = require('../service/vm/indexVm'),
    urlHelper = require('../service/urlHelper');

/* GET home page. */
router.get('/', function (req, res, next) {
    var preferredLocale = req.preferredLocale,
        skip = parseInt(req.query.skip, 10) || 0,
        tag = req.query.tag;

    indexVm.promise({
        preferredLocale: preferredLocale,
        skip: skip,
        user: req.user,
        admin: req.userHasAdminRights,
        url: req.originalUrl,
        tag: tag
    })
        .then(function (vm) {
            vm.pageUrl = urlHelper.combine(urlHelper.hostUrl, req.originalUrl);
            if (req.wantJson) {
                delete vm.user;
                delete vm.preferredLocale;
                delete vm.navlinksFooter;
                delete vm.navlinksMain;
                delete vm.settings;
                res.json(vm);
            } else {
                res.render('public/index', vm);
            }
            return vm;
        })
        .then(null, next);
});

router.get('/demo', function (req, res, next) {
    var preferredLocale = req.preferredLocale,
        skip = parseInt(req.query.skip, 10) || 0;

    indexVm.promise({
        preferredLocale: preferredLocale,
        skip: skip,
        user: req.user,
        admin: req.userHasAdminRights,
        url: req.url
    })
        .then(function (vm) {
            res.render('public/demo', vm);
            return vm;
        })
        .then(null, next);
});

module.exports = router;
