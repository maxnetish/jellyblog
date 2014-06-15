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
            var query = $routeParams.query ? JSON.parse($routeParams.query) : {};

            if (window.admin) {
                query.includeDraft = 1;
            }
            query.limit = 5;

            dataService.postProvider.query(query)
                .then(function (result) {
                    var toDate, fromDate;
                    if (result.data && result.data.length == query.limit) {
                        toDate = result.data[result.data.length - 1].date;
                        fromDate=result.data[0].date;
                        $scope.state.nextPageQuery = angular.toJson({
                            toDate: toDate
                        });
                        $scope.state.backPageQuery=angular.toJson({
                            fromDate: fromDate
                        })
                    } else {
                        $scope.state.nextDisable = true;
                    }
                    $scope.posts = result.data;
                });

            $scope.state = {
                nextPageQuery: ""
            };

        }
    ])
    .controller('postController',
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