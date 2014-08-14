/**
 * Created by Gordeev on 14.08.2014.
 */


var dataProvider = require('../dataProvider'),
    _ = require('underscore'),
    URL = require('url'),
    Q = require('q'),
    publicPageVm = require('./publicPageVm'),
    PostViewModel = function (row) {
        this.post = row.post || {};
    },
    getPrevPageUrl = function () {

    },
    getNextPageUrl = function () {

    },
    doReject = function (deferred) {
        return function (err) {
            deferred.reject(err);
            return err;
        };
    },
    promiseViewModel = function (opts) {
        var dfr = Q.defer(),
            reject = doReject(dfr),
            promisePublicPageVm,
            promisePost,
            promiseAdjacent;

        opts = opts || {
            preferredLocale: 'en',
            id: void 0,
            slug: void 0,
            user: void 0,
            admin: false,
            url: null,
            queryParams: {
                includeDrafts: false
            }
        };

        if (opts.id) {
            promisePost = dataProvider.promisePostGetById(opts.id);
        } else if (opts.slug) {
            promisePost = dataProvider.promisePostGetBySlug(opts.slug);
        }

        promisePost
            .then(function (post) {
                if (!post) {
                    // not found
                    var err = new Error('Not Found');
                    err.status = 404;
                    reject(err);
                    return post;
                }

                // found!
                promisePublicPageVm = publicPageVm.promise({
                    admin: opts.admin,
                    preferredLocale: opts.preferredLocale,
                    pageTitle: opts.pageTitle,
                    user: opts.user
                });

                promiseAdjacent = dataProvider.promisePostGetAdjacent(post._id.str, opts.queryParams);

                Q.all([promisePublicPageVm, promiseAdjacent])
                    .then(function (results) {
                        var publicPageVm = results[0],
                            adjacent = results[1],
                            vmIntern = new PostViewModel({
                                post: post
                            }),
                            vm;
                        vm = _.extend(vmIntern, publicPageVm);
                        vm.pager.urlOlder = getNextPageUrl(adjacent.next, opts.url);
                        vm.pager.urlNewer = getPrevPageUrl(adjacent.prev, opts.url);
                        vm.pageTitle = post.title;
                        dfr.resolve(vm);
                        return results;
                    })
                    .then(null, reject);
            })
            .then(null, reject);
        return dfr.promise;
    };

module.exports = {
    promise: promiseViewModel
};