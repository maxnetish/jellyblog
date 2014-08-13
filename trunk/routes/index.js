var express = require('express'),
    router = express.Router(),
    preferredLocaleService = require('../service/preferredLocale'),
    indexVm = require('../service/vm/indexVm');

/* GET home page. */
router.get('/', function (req, res) {
    var preferredLocale = preferredLocaleService.detect(req),
        skip = parseInt(req.query.skip, 10) || 0;

    indexVm.promise({
        preferredLocale: preferredLocale,
        skip: skip,
        user: req.user,
        admin: req.userHasAdminRights,
        url: req.url
    })
        .then(function (vm) {
            res.render('public/index', vm);
            return vm;
        })
        .then(null, function (err) {
            res.send(500, err);
            return err;
        });
});

module.exports = router;
