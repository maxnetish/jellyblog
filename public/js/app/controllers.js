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
        function ($scope, $routeParams, dataService) {
            var query = $routeParams.query ? JSON.parse($routeParams.query) : {};

            if (window.admin) {
                query.includeDraft = 1;
            }

            dataService.postProvider.query(query)
                .then(function (result) {
                    $scope.posts = result.data;
                });
        }
    ])
    .controller('postController',
    [
        '$scope',
        '$routeParams',
        'dataService',
        function ($scope, $routeParams, dataService) {
            var postId = $routeParams.postId;

            dataService.postProvider.get(postId)
                .then(function (result) {
                    $scope.post = result.data;
                })
                .then(null, function(err){
                    var foo=err;
                });

        }
    ]);