var express = require('express'),
    router = express.Router(),
    indexVm = require('../service/vm/indexVm'),
    errResponse = require('../service/errResponse');

/* GET home page. */
router.get('/', function (req, res) {
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
            res.render('public/index', vm);
            return vm;
        })
        .then(null, function (err) {
            errResponse(err, req, res);
            return err;
        });
});

router.get('/demo', function (req, res) {
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
        .then(null, function (err) {
            errResponse(err, req, res);
            return err;
        });
});

module.exports = router;
