/**
 * Created by Gordeev on 12.06.2014.
 */
var express = require('express');
var router = express.Router();

/* GET admin page. */
router.get('/', function (req, res) {
    if (!req.userHasAdminRights) {
        req.session.after = req.originalUrl;
        res.redirect('/auth/google');
        return;
    }

    res.render('admin/admin', {
        title: 'Admin app',
        user: req.user || {},
        admin: req.userHasAdminRights
    });
});

module.exports = router;