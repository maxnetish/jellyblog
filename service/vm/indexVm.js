/**
 * Created by Gordeev on 12.08.2014.
 */


var dataProvider = require('../dataProvider'),
    _ = require('underscore'),
    URL = require('url'),
    Q = require('q'),
    publicPageVm = require('./publicPageVm'),
    IndexViewModel = function (row) {
        this.postList = row.postList || [];
    },
    getPrevPageUrl = function (url, skip, limit) {
        var prevSkip, urlParsed, result;
        skip = skip || 0;

        if (!url) {
            return result;
        }
        if (skip === 0) {
            return result;
        }

        urlParsed = URL.parse(url, true);
        urlParsed.search = null;
        prevSkip = skip - limit;
        prevSkip = prevSkip < 0 ? 0 : prevSkip;
        if (prevSkip === 0) {
            delete urlParsed.query.skip;
        } else {
            urlParsed.query.skip = prevSkip;
        }
        result = URL.format(urlParsed);
        return result;
    },
    getNextPageUrl = function (url, skip, limit, hasNext) {
        var nextSkip, urlParsed, result;
        skip = skip || 0;

        if (!url) {
            return result;
        }
        if (!hasNext) {
            return result;
        }

        urlParsed = URL.parse(url, true);
        urlParsed.search = null;
        nextSkip = skip + limit;
        urlParsed.query.skip = nextSkip;
        result = URL.format(urlParsed);
        return result;
    },
    doReject = function (deferred) {
        return function (err) {
            deferred.reject(err);
            return err;
        };
    },
    promiseViewModel = function (opts) {
        var dfr = Q.defer(),
            reject = doReject(dfr);

        opts = opts || {
            preferredLocale: 'en',
            skip: 0,
            user: void 0,
            admin: false,
            url: null
        };

        // get base vm first
        publicPageVm.promise()
            .then(function (baseVm) {
                dataProvider.promisePostsList({
                    limit: baseVm.settings.postsPerPage + 1,
                    skip: opts.skip
                }, true)
                    .then(function (posts) {
                        var hasNext = (posts.length - baseVm.settings.postsPerPage) > 0,
                            vmIntern = new IndexViewModel({
                                postList: _.first(posts, baseVm.settings.postsPerPage)
                            }),
                            vm;
                        vm = _.extend(vmIntern, baseVm);
                        vm.pager.urlOlder = getNextPageUrl(opts.url, opts.skip, vm.settings.postsPerPage, hasNext);
                        vm.pager.urlNewer = getPrevPageUrl(opts.url, opts.skip, vm.settings.postsPerPage);
                        dfr.resolve(vm);
                        return posts;
                    })
                    .then(null, reject);
            })
            .then(null, reject);
        return dfr.promise;
    };

module.exports = {
    promise: promiseViewModel
};