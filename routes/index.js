var express = require('express'),
    router = express.Router(),
    dataProvider = require('../service/dataProvider'),
    Q = require('q'),
    _ = require('underscore'),
    moment = require('moment');

/* GET home page. */
router.get('/', function (req, res) {
    var mainNavlinksPromise = dataProvider.promiseNavlinkList({
            category: 'main',
            visible: true
        }),
        footerNavlinkPromise = dataProvider.promiseNavlinkList({
            category: 'footer',
            visible: true
        }),
        settingsPromise = dataProvider.promiseSettings(),
        preferredLocal = 'en',
        commaPos = -1,
        langHeader = 'accept-language';

    if (req.headers[langHeader] && req.headers[langHeader].length) {
        commaPos = req.headers[langHeader].indexOf(',');
        if (commaPos > 0) {
            preferredLocal = req.headers[langHeader].substring(0, commaPos);
        }
    }

    settingsPromise
        .then(function (settings) {
            var postsPromise = dataProvider.promisePostsList({
                limit: settings.postsPerPage,
                skip: 0
            }, true);
            Q.all([mainNavlinksPromise, footerNavlinkPromise, postsPromise])
                .then(function (promiseResults) {
                    var posts = promiseResults[2];
                    _.each(posts, function (post) {
                        post.dateFormatted = moment(post.date).lang(preferredLocal).format('LL');
                    });

                    return res.render('public/index', {
                        title: 'Express',
                        user: req.user || {},
                        admin: req.userHasAdminRights,
                        navlinksMain: promiseResults[0],
                        navlinksFooter: promiseResults[1],
                        settings: settings,
                        postList: posts,
                        preferredLocal: preferredLocal
                    });
                })
                .then(null, function (err) {
                    return res.send(500, err);
                });
        })
        .then(null, function (err) {
            return res.send(500, err);
        });


});

module.exports = router;
