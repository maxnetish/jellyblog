/**
 * Created by mgordeev on 26.08.2014.
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
        (function (viewSelector) {
            if(!susanin.supported() || susanin.disabled()){
                return;
            }

            var routeDefinitions = vm.routes,
                applyBindingOnce = _.once(function () {
                    if(vm && viewSelector) {
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
                };

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
                console.log('Rescue path: ' + path);
            });


            susanin.listen(); // no fallback to hashbangs

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
        })('#app-view');
    });