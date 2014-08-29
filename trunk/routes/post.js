/**
 * Created by mgordeev on 14.08.2014.
 */
var express = require('express'),
    router = express.Router(),
    postVm = require('../service/vm/postVm'),
    urlHelper = require('../service/urlHelper');

router.get('/:slug?', function (req, res, next) {
    var slug = req.params.slug,
        id = req.query.id,
        locale = req.preferredLocale;

    postVm.promise({
        preferredLocale: locale,
        id: id,
        slug: slug,
        user: req.user,
        admin: req.userHasAdminRights,
        queryParams: {
            includeDrafts: false
        }
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
        }).then(null, next);
});

module.exports = router;