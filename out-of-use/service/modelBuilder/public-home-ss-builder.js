var Q = require('q');
var _ = require('lodash');
var express = require('express');
var dataProvider = require('../dataProvider');
var isomorphUtils = require('../isomorph-utils');

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
                            navPager: isomorphUtils.generatePaginationUrlParams(posts, req.query.skip, prevResult.misc.postsPerPage)
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
