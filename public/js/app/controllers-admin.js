/**
 * Created by Gordeev on 14.06.2014.
 */
angular.module('jellyControllersAdmin',
    [
        'dataServiceModule',
        'jellyServices'
    ])
    .directive('jellyMenuAddSave',
    [
        function () {
            return{
                priority: 0,
                terminal: false,
                templateUrl: 'partials/menu-add-save-tpl',
                replace: false,
                transclude: false,
                restrict: 'EA',
                scope: {
                    save: '=',
                    add: '=',
                    category: '=',
                    saveDisabled: '='
                }
            }
        }
    ])
    .directive('jellyMenuEditor',
    [
        'jellyIcons',
        function (jellyIcons) {
            return{
                priority: 0,
                terminal: false,
                templateUrl: 'partials/menu-edit-tpl',
                replace: false,
                transclude: false,
                restrict: 'EA',
                scope: {
                    navlinks: '='
                },
                controller: function ($scope, $element, $attrs, $transclude) {
                    $scope.removeNavlink = function (navlink) {
                        navlink.willRemove = true;
                    };

                    $scope.upNavlink = function (navlink) {
                        var ind = $scope.navlinks.indexOf(navlink);
                        if (ind === 0 || $scope.navlinks.length < 2) {
                            return;
                        }
                        $scope.navlinks.splice(ind, 1);
                        $scope.navlinks.splice(ind - 1, 0, navlink);
                    };

                    $scope.downNavlink = function (navlink) {
                        var ind = $scope.navlinks.indexOf(navlink);
                        if ($scope.navlinks.length < 2 || ind === ($scope.navlinks.length - 1)) {
                            return;
                        }
                        $scope.navlinks.splice(ind, 1);
                        $scope.navlinks.splice(ind + 1, 0, navlink);
                    };

                    $scope.icons = jellyIcons;
                }
            }
        }
    ])
    .controller('filesController',
    [
        '$scope',
        '$routeParams',
        'dataService',
        'jellyLogger',
        function ($scope, routeParams, dataService, logger) {
            dataService.uploadProvider.query()
                .then(function (result) {
                    $scope.files = result.data;
                })
                .then(null, function (err) {
                    logger.log(err);
                });
        }
    ])
    .controller('miscController',
    [
        '$scope',
        '$q',
        'dataService',
        'utils',
        'jellyLogger',
        function ($scope, Q, dataService, utils, logger) {

            var setOrder = function (list, orderProp) {
                var ind, listLen, item, orderVal;
                orderProp = orderProp || 'order';

                for (ind = 0, listLen = list.length; ind < listLen; ind++) {
                    item = list[ind];
                    orderVal = ind;
                    item[orderProp] = orderVal;
                }
            };

            var saveNavlinks = function (categ) {
                var promises = [],
                    savingList,
                    categ = categ || 'main';

                if (categ == 'main') {
                    savingList = $scope.mainNavlinks;
                } else if (categ == 'footer') {
                    savingList = $scope.footerNavlinks;
                }

                if (!savingList) {
                    return;
                }

                // make order:
                setOrder(savingList);

                //prepare callbacks:
                var onRemoveItem = function (data) {
                    var navlink = data.data;
                    var ind = utils.findIndex(savingList, function (item) {
                        return item._id === navlink._id;
                    });
                    savingList.splice(ind, 1);
                    return data;
                };
                var onSaveItem = function (data) {
                    var navlink = data.data;
                    var ind = utils.findIndex(savingList, function (item) {
                        return item.order == navlink.order;
                    });
                    savingList[ind] = navlink;
                    return data;
                };
                var onAllUpdated = function (data) {
                    logger.log(data);
                    switch (categ) {
                        case 'main':
                            $scope.mainNavlinksForm.$setDirty(false);
                            $scope.mainNavlinksForm.$setPristine(true);
                            break;
                        case 'footer':
                            $scope.footerNavlinksForm.$setDirty(false);
                            $scope.footerNavlinksForm.$setPristine(true);
                            break;
                    }
                };

                //prepare promises:
                angular.forEach(savingList, function (navlink) {
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
                    return result;
                })
                .then(null, function (err) {
                    logger.log(err);
                });
            dataService.navlinkProvider.query('footer')
                .then(function (result) {
                    $scope.footerNavlinks = angular.copy(result.data);
                    return result;
                })
                .then(null, function (err) {
                    logger.log(err);
                });

            $scope.addNavlink = function (categ) {
                var navlink = new dataService.Navlink({
                    category: categ
                });

                switch (categ) {
                    case 'main':
                        $scope.mainNavlinks.push(navlink);
                        break;
                    case 'footer':
                        $scope.footerNavlinks.push(navlink);
                        break;
                }
            };

            $scope.saveNavlinks = function (categ) {
                saveNavlinks(categ);
            };

            $scope.upload = function () {
                var f = document.getElementById('file').files[0];

                dataService.uploadProvider.save(f)
                    .then(function (result) {
                        angular.forEach(result.data, function (fileInfo) {
                            $scope.files.push(fileInfo);
                        });
                    })
                    .then(null, function (err) {
                        //TODO err handler
                    });
            };


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