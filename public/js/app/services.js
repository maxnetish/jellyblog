/**
 * Created by mgordeev on 17.06.2014.
 */

angular.module('jellyServices',
    [
        'pascalprecht.translate'
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
        function () {
            var log = function (errObject) {
                if (window.console) {
                    console.log('ERROR:');
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