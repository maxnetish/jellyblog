/**
 * Created by Gordeev on 14.08.2014.
 */


var dataProvider = require('../dataProvider'),
    _ = require('underscore'),
    URL = require('url'),
    Q = require('q'),
    publicPageVm = require('./publicPageVm'),
    urlHelper = require('../urlHelper'),
    PostViewModel = function (row) {
        this.postList = [];
        if (row.post) {
            this.postList.push(row.post);
        }
        this.disableCut = true;
        this.disablePermalink = true;
        this.rootUrl = urlHelper.rootUrl;
        this.metaTitle = row.metaTitle;
        this.metaDescription = row.metaDescription;
        this.metaImage = row.metaImage;
    },
    getAdjacentPageUrl = function (postInfo) {
        var postUrl,
            result;

        if (!(postInfo && (postInfo._id || postInfo.slug))) {
            return null;
        }

        postUrl = postInfo.url;
        result = URL.format(postUrl);

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
            reject = doReject(dfr),
            reject404 = function () {
                var err = new Error('Not Found');
                err.status = 404;
                reject(err);
            },
            promisePublicPageVm,
            promisePost,
            promiseAdjacent;

        opts = opts || {
            preferredLocale: 'en',
            id: void 0,
            slug: void 0,
            user: void 0,
            admin: false,
            queryParams: {
                includeDrafts: false
            }
        };

        if (opts.id) {
            promisePost = dataProvider.promisePostGetById(opts.id);
        } else if (opts.slug) {
            promisePost = dataProvider.promisePostGetBySlug(opts.slug);
        } else {
            reject404();
            return dfr.promise;
        }

        promisePost
            .then(function (post) {
                if (!post) {
                    // not found
                    reject404();
                    return post;
                }
                if (post.draft) {
                    // not show drafts
                    reject404();
                    return post;
                }

                // found!
                promisePublicPageVm = publicPageVm.promise({
                    admin: opts.admin,
                    preferredLocale: opts.preferredLocale,
                    pageTitle: opts.pageTitle,
                    user: opts.user
                });

                promiseAdjacent = dataProvider.promisePostGetAdjacent(post._id, opts.queryParams);

                Q.all([promisePublicPageVm, promiseAdjacent])
                    .then(function (results) {
                        var publicPageVm = results[0],
                            adjacent = results[1],
                            vmIntern = new PostViewModel({
                                post: post.getPlainObject(opts.preferredLocale, null, true)
                            }),
                            vm;
                        vm = _.extend(vmIntern, publicPageVm);
                        vm.pager.urlOlder = getAdjacentPageUrl(adjacent.next);
                        vm.pager.urlNewer = getAdjacentPageUrl(adjacent.prev);
                        vm.pageTitle = post.title;
                        vm.metaTitle = post.metaTitle || vm.settings.metaTitle;
                        vm.metaDescription = post.metaDescription || vm.settings.metaDescription;
                        vm.metaImage = post.image || vm.settings.authorAvatarUrl
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