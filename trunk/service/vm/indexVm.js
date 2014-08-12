/**
 * Created by Gordeev on 12.08.2014.
 */


var dataProvider = require('../dataProvider'),
    _ = require('underscore'),
    moment = require('moment'),
    Q = require('q'),
    keyMain = 'main',
    keyFooter = 'footer',
    vmProps = Object.freeze({
        pageTitle: {
            configurable: false,
            enumerable: true,
            value: 'Express',
            writable: true
        },
        user: {
            configurable: false,
            enumerable: true,
            value: void 0,
            writable: true
        },
        admin: {
            configurable: false,
            enumerable: true,
            value: false,
            writable: true
        },
        navlinksMain: {
            configurable: false,
            enumerable: true,
            value: void 0,
            writable: true
        },
        navlinksFooter: {
            configurable: false,
            enumerable: true,
            value: void 0,
            writable: true
        },
        settings: {
            configurable: false,
            enumerable: true,
            value: void 0,
            writable: true
        },
        postList: {
            configurable: false,
            enumerable: true,
            value: void 0,
            writable: true
        },
        preferredLocale: {
            configurable: false,
            enumerable: true,
            value: 'en',
            writable: true
        }
    }),
    IndexViewModel = function () {
        return Object.create({}, vmProps);
    },
    processPost = function (locale, momentDateFormat) {
        return function (post) {
            locale = locale || 'en';
            momentDateFormat = momentDateFormat || 'LL';
            post.dateFormatted = moment(post.date).lang(locale).format(momentDateFormat);
            return post;
        };
    },
    processPostList = function (rowList, locale, momentDateFormat) {
        return _.map(rowList, processPost(locale, momentDateFormat));
    },
    doReject = function (deferred) {
        return function (err) {
            deferred.reject(err);
            return err;
        };
    },
    promiseViewModel = function (opts) {
        var mainNavlinksPromise, footerNavlinkPromise,
            settingsPromise, postsPromise,
            dfr = Q.defer(),
            reject = doReject(dfr);

        opts = opts || {
            preferredLocale: 'en',
            skip: 0,
            user: void 0,
            admin: false
        };

        mainNavlinksPromise = dataProvider.promiseNavlinkList({
            category: keyMain,
            visible: true
        });
        footerNavlinkPromise = dataProvider.promiseNavlinkList({
            category: keyFooter,
            visible: true
        });
        settingsPromise = dataProvider.promiseSettings();

        settingsPromise
            .then(function (settings) {
                postsPromise = dataProvider.promisePostsList({
                    limit: settings.postsPerPage,
                    skip: opts.skip
                }, true);
                Q.all([mainNavlinksPromise, footerNavlinkPromise, postsPromise])
                    .then(function (results) {
                        var posts = processPostList(results[2], opts.preferredLocale),
                            navlinksMain = results[0],
                            navlinksFooter = results[1],
                            result = IndexViewModel();

                        result.user = opts.user;
                        result.admin = opts.admin;
                        result.navlinksMain = navlinksMain;
                        result.navlinksFooter = navlinksFooter;
                        result.settings = settings;
                        result.postList = posts;
                        result.preferredLocale = opts.preferredLocale;

                        dfr.resolve(result);

                        return result;
                    })
                    .then(null, reject);
            })
            .then(null, reject);

        return dfr.promise;
    };

module.exports = {
    promise: promiseViewModel
};