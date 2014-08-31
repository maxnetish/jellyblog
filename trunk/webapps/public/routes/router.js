/**
 * route - vm
 */
define('router',
    [
        'jquery',
        '_',
        'ko',
        'vm',
        'susanin-path'
    ],
    function ($, _, ko, vm, susanin) {
        'use strict';
        var viewSelector = '#app-view',
            routeDefinitions = vm.routes,
            applyBindingOnce = _.once(function () {
                if (vm && viewSelector) {
                    ko.applyBindings(vm, $(viewSelector).get(0));
                }
            }),
            createEnterCallback = function (definition) {
                return function (params) {
                    if (_.isFunction(definition.enter)) {
                        definition.enter(params);
                    }
                };
            },
            createOnCallback = function (definition) {
                return function (params) {
                    applyBindingOnce();
                    if (_.isFunction(definition.on)) {
                        definition.on(params);
                    }
                };
            },
            createExitCallback = function (definition) {
                return function (params) {
                    if (_.isFunction(definition.exit)) {
                        definition.exit(params);
                    }
                };
            },
            run = function () {
                if (!susanin.supported() || susanin.disabled()) {
                    return false;
                }

                _.each(routeDefinitions, function (definition) {
                    if (_.isString(definition.route)) {
                        susanin.map(definition.route)
                            .enter(createEnterCallback(definition))
                            .to(createOnCallback(definition))
                            .exit(createExitCallback(definition));
                    }
                });
                susanin.rescue(function (path) {
                    // try to load from server
                    window.location = path;
                });
                susanin.listen();
                // bind anchors
                $('body').on('click', 'a[data-route]', function (e) {
                    var $this = $(this),
                        urlAttr = $this.data('route') || 'href',
                        href = $this.attr(urlAttr);
                    if (href) {
                        e.preventDefault();
                        susanin.pushState(null, null, href);
                    }
                });
                return true;
            };
        return {
            run: run
        }
    });