/**
 * Created by mgordeev on 17.06.2014.
 */
angular.module('jellyControllers',
    [
        'dataServiceModule',
        'jellyServices'
    ])
    .controller('mainMenuController',
    [
        '$scope',
        'dataService',
        'jellyLogger',
        function ($scope, dataService, logger) {
            dataService.navlinkProvider.query('main')
                .then(function (result) {
                    $scope.navlinks = result.data;
                })
                .then(null, function (err) {
                    logger.log(err);
                });
        }
    ]);