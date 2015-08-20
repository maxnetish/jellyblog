var Q = require('q');
var _ = require('lodash');
var express = require('express');
var dataProvider = require('../dataProvider');

function generatePaginationUrlParams(posts, skip, limit) {
    var result = {
        previous: null,
        next: null
    };

    posts = posts || [];
    skip = parseInt(skip, 10) || 0;
    limit = parseInt(limit, 10) || Number.POSITIVE_INFINITY;

    if (posts.length >= limit) {
        // not last page
        result.previous = {
            skip: skip + posts.length
        }
    }

    if (skip > 0) {
        result.next = {
            skip: skip - limit
        }
    }

    return result;
}

function buildHomePostsModel(req) {
    var modelBuilder = [];

    var model = {
        developmentMode: !!req.query.debug || express().get('env') === 'development',
        admin: !!req.userHasAdminRights,
        user: req.user,
        preferredLocale: req.preferredLocale
    };

    modelBuilder.push(dataProvider.promiseNavlinkList()
            .then(function (navlinks) {
                return {
                    navlinks: navlinks
                };
            })
    );

    // first, retrieve settings
    // when settings getted -> retrieve posts and generate prev/next urls
    modelBuilder.push(dataProvider.promiseSettings()
            .then(function (settings) {
                return {
                    misc: settings
                };
            })
            .then(function (prevResult) {
                return dataProvider.promisePaginationPosts(req.query, req.preferredLocale, prevResult.misc.postsPerPage)
                    .then(function (posts) {
                        // generate pagination urls
                        //prevResult

                        return _.assign(prevResult, {
                            posts: posts,
                            navPager: generatePaginationUrlParams(posts, req.skip, prevResult.misc.postsPerPage)
                        });
                    });
            })
    );

    return Q.all(modelBuilder)
        .then(function (result) {
            var collectedModel = _.reduce(result, function (accumulator, value) {
                return _.assign(accumulator, value);
            }, model);
            return collectedModel;
        });
}

module.exports = {
    build: buildHomePostsModel
};
