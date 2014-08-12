/**
 * Created by Gordeev on 27.07.2014.
 */
define('vm.posts',
    [
        'ko',
        '_',
        'data.posts',
        'messenger',
        'logger'
    ],
    function (ko, _, dataPosts, messenger, logger) {
        'use strict';

        /**
         * one page default limit
         * @type {number}
         */
        var limit = 8,
            postsList = ko.observableArray(),

        // pagination
            /**
             * current page params
             */
            queryUrl = ko.observable(undefined),
            nextPageUrl = ko.computed({
                read: function () {
                    var currentQuery = queryUrl(),
                        nextQuery,
                        result;
                    if (!currentQuery) {
                        return null;
                    }
                    if (postsList().length < currentQuery.limit) {
                        return null;
                    }
                    nextQuery = _.cloneDeep(currentQuery);
                    nextQuery.skip = nextQuery.skip + nextQuery.limit;
                    result = '#!/posts/' + encodeURIComponent(JSON.stringify(nextQuery));
                    return result;
                }
            }),
            prevPageUrl = ko.computed({
                read: function () {
                    var currentQuery = queryUrl(),
                        prevQuery,
                        result;
                    if (!currentQuery) {
                        return null;
                    }
                    if (currentQuery.skip === 0) {
                        return null;
                    }
                    prevQuery = _.cloneDeep(currentQuery);
                    prevQuery.skip = prevQuery.skip - prevQuery.limit;
                    prevQuery.skip = prevQuery.skip >= 0 ? prevQuery.skip : 0;
                    result = '#!/posts/' + encodeURIComponent(JSON.stringify(prevQuery));
                    return result;
                }
            }),
            startPageUrl = ko.computed({
                read: function () {
                    var currentQuery = queryUrl();
                    if (!currentQuery) {
                        return null;
                    }
                    if (currentQuery.skip === 0) {
                        return null;
                    }
                    return '#!/posts';
                }
            }),
            checkDefaultOptions = function (query) {
                query = query || {};
                if (!query.hasOwnProperty('includeDraft')) {
                    query.includeDraft = true;
                }
                query.skip = query.skip || 0;
                query.limit = query.limit || limit;
                return query;
            },

            /**
             * update when url params changed
             */
            updateData = function () {
                dataPosts.query(queryUrl())
                    .done(function (result) {
                        postsList.removeAll();
                        ko.utils.arrayPushAll(postsList, result);
                    });
            },
            /**
             * when url changed...
             * @param stateParams
             */
            activate = function (stateParams) {
                var newQuery;
                // get and parse query params
                if (stateParams && stateParams.params && stateParams.params.query) {
                    try {
                        newQuery = JSON.parse(decodeURIComponent(stateParams.params.query));
                    }
                    catch (err) {
                        logger.log(err);
                    }
                }
                newQuery = checkDefaultOptions(newQuery);
                if (!_.isEqual(newQuery, queryUrl())) {
                    // update queryUrl if params really changed
                    queryUrl(newQuery);
                }
            };

        // update data when url params changed
        queryUrl.subscribe(updateData);
        messenger.subscribe(messenger.messageNames.PostUpdated, updateData);

        return{
            activate: activate,
            posts: postsList,
            pagination: {
                nextPageUrl: nextPageUrl,
                prevPageUrl: prevPageUrl,
                startPageUrl: startPageUrl
            }
        };
    });