var express = require('express'),
    router = express.Router(),
    dataProvider = require('../service/dataProvider'),
    Q = require('q');

/* GET home page. */
router.get('/', function (req, res) {
    var mainNavlinksPromise = dataProvider.promiseNavlinkList({
            category: 'main',
            visible: true
        }),
        footerNavlinkPromise = dataProvider.promiseNavlinkList({
            category: 'footer',
            visible: true
        });

    Q.all([mainNavlinksPromise, footerNavlinkPromise])
        .then(function (promiseResults) {
            return res.render('index', {
                title: 'Express',
                user: req.user || {},
                admin: req.userHasAdminRights,
                navlinksMain: promiseResults[0],
                navlinksFooter: promiseResults[1]
            });
        })
        .then(null, function (err) {
            return res.send(500, err);
        });
});

module.exports = router;
