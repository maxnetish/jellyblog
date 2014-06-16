/**
 * Created by Gordeev on 14.06.2014.
 */
angular.module('jellyControllers',
    [
        'dataServiceModule'
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

        }
    ])
;