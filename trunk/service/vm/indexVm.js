/**
 * Created by Gordeev on 12.08.2014.
 */


var dataProvider = require('../dataProvider'),
    _ = require('underscore'),
    moment = require('moment'),
    URL = require('url'),
    Q = require('q'),
    keyMain = 'main',
    keyFooter = 'footer',
    vmCommon = require('./commonVm'),
    vmProps = Object.freeze({
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
        pager: {
            configurable: false,
            enumerable: true,
            writable: true,
            value: {
                urlOlder: undefined,
                urlNewer: undefined
            }
        }
    }),
    IndexViewModel = function () {
        return Object.create(new vmCommon.BaseViewModel(), vmProps);
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
    getPagerUrls = function (url, skip, limit, hasNext) {
        var nextSkip, prevSkip,
            urlParsed,
            result = {
                nextUrl: undefined,
                prevUrl: undefined
            };

        if (!url) {
            return result;
        }

        if (hasNext) {
            nextSkip = skip + limit;
        }

        if (skip !== 0) {
            prevSkip = skip - limit;
            if (prevSkip < 0) {
                prevSkip = 0;
            }
        }

        urlParsed = URL.parse(url);

        if (nextSkip) {
            urlParsed.query = {
                skip: nextSkip
            };
            urlParsed.search = null;
            result.nextUrl = URL.format(urlParsed);
        }
        if (_.isNumber(prevSkip)) {
            if (prevSkip === 0) {
                urlParsed.query = null;
            } else {
                urlParsed.query = {
                    skip: prevSkip
                };
            }
            urlParsed.search = null;
            result.prevUrl = URL.format(urlParsed);
        }
        return result;
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
            admin: false,
            url: null
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
                    limit: settings.postsPerPage + 1,
                    skip: opts.skip
                }, true);
                Q.all([mainNavlinksPromise, footerNavlinkPromise, postsPromise])
                    .then(function (results) {
                        var posts = processPostList(results[2], opts.preferredLocale),
                            navlinksMain = results[0],
                            navlinksFooter = results[1],
                            result = IndexViewModel(),
                            pagerUrls = getPagerUrls(opts.url, opts.skip, settings.postsPerPage, (posts.length - settings.postsPerPage) > 0);

                        result.user = opts.user;
                        result.admin = opts.admin;
                        result.navlinksMain = navlinksMain;
                        result.navlinksFooter = navlinksFooter;
                        result.settings = settings;
                        result.postList = _.first(posts, settings.postsPerPage);
                        result.preferredLocale = opts.preferredLocale;
                        result.pager.urlOlder = pagerUrls.nextUrl;
                        result.pager.urlNewer = pagerUrls.prevUrl;

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