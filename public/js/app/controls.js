/**
 * Created by Gordeev on 22.06.2014.
 */
angular.module('jellyControls',
    [
    ])
    .directive('jellySelectIconClass',
    [
        function () {
            return {
                //compile: function compile(temaplateElement, templateAttrs) {
                //    return {
                //        pre: function (scope, element, attrs) {
                //        },
                //        post: function (scope, element, attrs) {
                //        }
                //    }
                //},
                link: function (scope, element, attrs) {
                    // create popup list, если он ещё не создан
                    var popupListDOMelement = document.getElementById('jelly-select-icon-class');
                    var popupList;

                    var createPopupList = function () {
                        var result = angular.element('<div>')
                            .css({
                                display: 'none',
                                position: 'absolute',
                                width: 300,
                                height: 300
                            })
                            .attr({
                                id: 'jelly-select-icon-class'
                            })
                            .append('<ul class="list-unstyled">');
                        angular.element(document.getElementsByTagName('body')).append(result);
                        return result;
                    };

                    if (popupListDOMelement) {
                        popupList = angulat.element(popupListDOMelement);
                    } else {
                        popupList = createPopupList();
                    }
                },
                priority: 0,
                terminal: false,
                //template: '<button class="btn btn-">',
                //templateUrl: 'partials/select-icon',
                replace: false,
                transclude: false,
                restrict: 'A',
                scope: false
                //controller: function ($scope, $element, $attrs, $transclude, otherInjectables) {
                //}
            }
        }
    ]);
