/**
 * Created by Gordeev on 13.06.2014.
 */

angular.module('jellyApp',
    [
        'ngRoute',
        'pascalprecht.translate'
    ])
    // config localization:
    .config(['$translateProvider', function ($translateProvider) {
        $translateProvider.useUrlLoader('api/locale');
        $translateProvider.determinePreferredLanguage();
    }]);