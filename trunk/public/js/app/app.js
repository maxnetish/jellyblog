/**
 * Created by Gordeev on 13.06.2014.
 */

(function () {
    var langCode = window.navigator.userLanguage || window.navigator.language;
    moment.lang(langCode);
})();

angular.module('jellyApp',
    [
        'ngRoute',
        'ngSanitize',
        'pascalprecht.translate',
        'jellyControllers'
    ])
    // config localization:
    .config(['$translateProvider', function ($translateProvider) {
        $translateProvider.useUrlLoader('/api/locale');
        $translateProvider.determinePreferredLanguage();
        $translateProvider.fallbackLanguage('en');
    }])
    .factory('jellyLogger',
    [
        '$http',
        function ($http) {
            var log = function (errObject) {
                if (window.console) {
                    console.log('ERROR:')
                    if (console.dir) {
                        console.dir(errObject);
                        console.log('');
                    }
                }
            };
            return {
                log: log
            };
        }
    ])
    .constant('ROUTE_PATHS', {
        POSTS: '/posts/:query?',
        EDIT: '/edit/:postId?'
    })
    .config(
    [
        '$locationProvider',
        function ($locationProvider) {
            $locationProvider.hashPrefix('!');
        }
    ])
    .config(
    [
        '$routeProvider',
        'ROUTE_PATHS',
        function ($routeProvider, paths) {
            $routeProvider
                .when(paths.POSTS, {
                    templateUrl: '/partials/admin-posts',
                    controller: 'postsController'
                })
                .when(paths.EDIT, {
                    templateUrl: '/partials/admin-edit-post',
                    controller: 'postController'
                })
                .otherwise({
                    redirectTo: '/posts'
                });
        }
    ])
    .directive("jellyDateEditor", function ($filter) {
        return {
            require: 'ngModel',
            link: function (scope, element, attrs, ngModel) {
                if (!ngModel) {
                    return;
                }
                ngModel.$parsers.unshift(
                    function (viewValue) {
                        var date = new Date(viewValue);
                        if (isNaN(date.getTime())) {
                            // invalid date:
                            ngModel.$setValidity('jellyDate', false);
                            return null;
                        }
                        ngModel.$setValidity('jellyDate', true);
                        return date;
                    });
                ngModel.$formatters.unshift(function (v) {
                    var formatted = $filter('date')(v, 'yyyy-MM-dd');
                    return formatted;
                });
            }
        };
    })
    .filter('jellydate', function () {
        return function (input) {
            // input will be Date
            if (angular.isDate(input)) {

                return moment(input).format('LL');
            } else {
                return input;
            }
        };
    })
    .directive("jellyTagEditor", function () {
        return{
            require: 'ngModel',
            link: function (scope, element, attrs, ngModel) {
                if (!ngModel) {
                    return;
                }
                ngModel.$parsers.unshift(
                    function (viewValue) {
                        var tagsArray = viewValue.split(' ');
                        return tagsArray;
                    });
                ngModel.$formatters.unshift(function (v) {
                    var formatted = '';
                    angular.forEach(v, function (item) {
                        if (formatted.length) {
                            formatted = formatted + ' ' + item;
                        } else {
                            formatted = item;
                        }
                    });
                    return formatted;
                });
            }
        };
    });