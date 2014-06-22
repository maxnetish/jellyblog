/**
 * Created by Gordeev on 14.06.2014.
 */
angular.module('jellyControllersAdmin',
    [
        'dataServiceModule',
        'jellyServices'
    ])
    .controller('miscController',
    [
        '$scope',
        '$q',
        'dataService',
        'utils',
        'jellyLogger',
        'jellyIcons',
        function ($scope, Q, dataService, utils, logger, jellyIcons) {

            var setOrder = function (list, orderProp) {
                var ind, listLen, item, orderVal;
                orderProp = orderProp || 'order';

                for (ind = 0, listLen = list.length; ind < listLen; ind++) {
                    item = list[ind];
                    orderVal = ind;
                    item[orderProp] = orderVal;
                }
            };

            var saveNavlinks = function () {
                var promises = [];

                // make order:
                setOrder($scope.mainNavlinks);

                //prepare callbacks:
                var onRemoveItem = function (data) {
                    var navlink = data.data;
                    var ind = utils.findIndex($scope.mainNavlinks, function (item) {
                        return item._id === navlink._id;
                    });
                    $scope.mainNavlinks.splice(ind, 1);
                    return data;
                };
                var onSaveItem = function (data) {
                    var navlink = data.data;
                    var ind = utils.findIndex($scope.mainNavlinks, function (item) {
                        return item.order == navlink.order;
                    });
                    $scope.mainNavlinks[ind] = navlink;
                    return data;
                };
                var onAllUpdated = function (data) {
                    logger.log(data);
                    $scope.mainNavlinksForm.$setDirty(false);
                    $scope.mainNavlinksForm.$setPristine(true);
                };

                //prepare promises:
                angular.forEach($scope.mainNavlinks, function (navlink) {
                    // deleted:
                    if (navlink.willRemove && navlink._id) {
                        // deleted:
                        promises.push(dataService.navlinkProvider.remove(navlink)
                                .then(onRemoveItem)
                        );
                    } else {
                        // changed
                        promises.push(dataService.navlinkProvider.save(navlink)
                            .then(onSaveItem));
                    }
                });

                Q.all(promises)
                    .then(onAllUpdated);
            };

            dataService.navlinkProvider.query('main')
                .then(function (result) {
                    $scope.mainNavlinks = angular.copy(result.data);
                    //$scope.mainNavlinksOriginal=angular.copy(result.data);
                    // $scope.mainNavlinksForm.$setDirty(false);
                    // $scope.mainNavlinksForm.$setPristine(true);
                    return result;
                })
                .then(null, function (err) {
                    logger.log(err);
                });

            /*
             $scope.mainNavlinksVisible = function () {
             var result = [];
             angular.forEach($scope.mainNavlinks, function (item) {
             if (!item.willRemove) {
             result.push(item);
             }
             })
             return result;
             };
             */

            $scope.addMainNavlink = function () {
                var navlink = new dataService.Navlink();
                $scope.mainNavlinks.push(navlink);
            };

            $scope.removeMainNavlink = function (navlink) {
                navlink.willRemove = true;
            };

            $scope.save = function () {
                saveNavlinks();
            };

            $scope.upMainNavlink = function (navlink) {
                var ind = $scope.mainNavlinks.indexOf(navlink);
                if (ind === 0 || $scope.mainNavlinks.length < 2) {
                    return;
                }
                $scope.mainNavlinks.splice(ind, 1);
                $scope.mainNavlinks.splice(ind - 1, 0, navlink);
            };

            $scope.downMainNavlink = function (navlink) {
                var ind = $scope.mainNavlinks.indexOf(navlink);
                if ($scope.mainNavlinks.length < 2 || ind === ($scope.mainNavlinks.length - 1)) {
                    return;
                }
                $scope.mainNavlinks.splice(ind, 1);
                $scope.mainNavlinks.splice(ind + 1, 0, navlink);
            }

            $scope.icons = jellyIcons;
        }
    ])
    .controller('postsController',
    [
        '$scope',
        '$routeParams',
        'dataService',
        'jellyLogger',
        function ($scope, $routeParams, dataService, logger) {
            var query = $routeParams.query ? angular.fromJson($routeParams.query) : {},
                skip = parseInt(query.skip, 10) || 0,
                limit = parseInt(query.limit, 10) || 5,
                nextQuery,
                backQuery,
                startQuery;

            if (window.admin) {
                query.includeDraft = 1;
            }
            query.limit = limit;
            query.skip = skip;

            dataService.postProvider.query(query)
                .then(function (result) {
                    $scope.posts = result.data;
                    $scope.state.nextDisable = result.data.length < limit;
                    $scope.state.backDisable = !query.skip;
                    $scope.state.startDisabled = !query.skip;
                });

            nextQuery = angular.copy(query);
            nextQuery.skip = (query.skip || 0) + limit;
            nextQuery.limit = limit;
            backQuery = angular.copy(query);
            backQuery.skip = (query.skip || 0) - limit;
            if (backQuery.skip <= 0) {
                backQuery.skip = 0;
            }
            backQuery.limit = limit;
            startQuery = angular.copy(query);
            startQuery.skip = 0;
            $scope.state = {
                nextQuery: angular.toJson(nextQuery),
                backQuery: angular.toJson(backQuery),
                startQuery: angular.toJson(startQuery),
                backDisable: true,
                nextDisable: true,
                startDisabled: true
            };

        }
    ])
    .
    controller('postController',
    [
        '$scope',
        '$routeParams',
        'dataService',
        'jellyLogger',
        function ($scope, $routeParams, dataService, logger) {
            var postId = $routeParams.postId;

            $scope.state = {
                saveDisabled: true,
                loadData: false
            };

            if (postId) {
                $scope.state.loadData = true;
                dataService.postProvider.get(postId)
                    .then(function (result) {
                        $scope.post = result.data;
                    })
                    .then(null, function (err) {
                        logger.log(err);
                        $scope.post = new dataService.PostDetailsModel();
                    })
                    ['finally'](function () {
                    $scope.state.saveDisabled = false;
                    $scope.state.loadData = false;
                });
            } else {
                $scope.post = new dataService.PostDetailsModel();
                $scope.state.saveDisabled = false;
            }

            $scope.save = function () {
                $scope.state.saveDisabled = true;
                $scope.state.loadData = true;
                dataService.postProvider.save($scope.post)
                    .then(function (result) {
                        $scope.post = result.data;
                        postId = result.data._id;
                        $scope.postForm.$setDirty(false);
                        $scope.postForm.$setPristine(true);
                        //var cache = $cacheFactory.get('$http');
                        //cache.removeAll();
                    })
                    .then(null, function (err) {
                        logger.log(err);
                    })
                    ['finally'](function () {
                    $scope.state.saveDisabled = false;
                    $scope.state.loadData = false;
                });
            };

            $scope.remove = function () {
                dataService.postProvider.remove($scope.post._id)
                    .then(function () {
                        window.location.hash = '!/posts';
                    })
                    .then(null, function (err) {
                        logger.log(err);
                    });
            };
        }
    ])
;