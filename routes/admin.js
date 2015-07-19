/**
 * Created by Gordeev on 12.06.2014.
 */
var express = require('express'),
    router = express.Router();

/* GET admin page. */
router.get('*', function (req, res) {

    res.render('../webapps/admin-index.jade', {
        title: 'Admin app',
        developmentMode: !!req.query.debug || express().get('env') === 'development',
        admin: !!req.userHasAdminRights,
        user: req.user,
        preferredLocale: req.preferredLocale,
        toInject: JSON.stringify({
            admin: !!req.userHasAdminRights,
            user: req.user,
            developmentMode: !!req.query.debug || express().get('env') === 'development',
            preferredLocale: req.preferredLocale
        })
    });
});

module.exports = router;