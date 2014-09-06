/**
 * Created by Gordeev on 27.07.2014.
 */
define('vm.posts',
    [
        'ko',
        '_',
        'data.posts',
        'data.post',
        'data.files',
        'messenger',
        'logger'
    ],
    function (ko, _, dataPosts, dataPost, dataFiles, messenger, logger) {
        'use strict';

        /**
         * one page default limit
         * @type {number}
         */
        var limit = 16,
            postsList = ko.observableArray(),
//            saving = ko.observable(false),

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
            },

            remove = function (post, event) {
                if (window.confirm('Delete post "' + post.title + '" permanently? Really?')) {
                    event.currentTarget.disabled = true;
                    dataPost.remove(post._id).done(updateData)
                        .always(afterUpdateAlways(event.currentTarget));
                }
            },

            removeAll = function(data, event){
                if(window.confirm('Delete all posts?') && window.confirm('Last chance to cancel removing of all posts. Really delete all posts?')){
                    event.currentTarget.disabled = true;
                    dataPost.remove('all').done(updateData)
                        .always(afterUpdateAlways(event.currentTarget));
                }
            },

            afterUpdateDone = function (update) {
                var itemToUpdate,
                    propToUpdate,
                    postsUnwrapped = ko.unwrap(postsList);

                console.dir(update);

                itemToUpdate = _.find(postsUnwrapped, function (item) {
                    return item._id === update._id;
                });

                if (!itemToUpdate) {
                    return;
                }

                propToUpdate = _.omit(update, ['_id']);
                _.each(propToUpdate, function (propValue, propName) {
                    if (ko.isObservable(itemToUpdate[propName])) {
                        itemToUpdate[propName](ko.unwrap(propValue));
                    } else {
                        itemToUpdate[propName] = ko.unwrap(propValue);
                    }
                });
            },

            afterUpdateAlways = function (targetButton) {
                return function () {
                    _.delay(function () {
                        targetButton.disabled = false;
                    }, 500);
                };
            },

            toggleDraft = function (post, event) {
                var draftValue = !post.draft();
                event.currentTarget.disabled = true;
                dataPost.savePlain({
                    _id: post._id,
                    draft: draftValue
                }).done(afterUpdateDone).always(afterUpdateAlways(event.currentTarget));
            },

            toggleFeatured = function (post, event) {
                var featuredValue = !post.featured();
                event.currentTarget.disabled = true;
                dataPost.savePlain({
                    _id: post._id,
                    featured: featuredValue
                }).done(afterUpdateDone).always(afterUpdateAlways(event.currentTarget));
            },

            uploadPosts = function(file, event){
                var f = file;
                event.currentTarget.disabled = true;
                dataFiles.uploadJsonPosts(f)
                    .done(updateData)
                    .always(afterUpdateAlways(event.currentTarget));
            };

        // update data when url params changed
        queryUrl.subscribe(updateData);
        messenger.subscribe(messenger.messageNames.PostUpdated, updateData);

        return{
            activate: activate,
            posts: postsList,
            toggleDraft: toggleDraft,
            toggleFeatured: toggleFeatured,
            remove: remove,
            removeAll: removeAll,
            uploadPosts: uploadPosts,
            pagination: {
                nextPageUrl: nextPageUrl,
                prevPageUrl: prevPageUrl,
                startPageUrl: startPageUrl
            }
        };
    });