/**
 * Created by Gordeev on 17.08.2014.
 */
define('susanin-path',
    [
        'lodash',
        'susanin-route'
    ],
    function (_, SusaninRoute) {
        'use strict';
        // internal members
        var historyInitial = {
                popped: null,
                URL: null
            },
            current,
            previous,
            extenderRoute = {
                'to': function (cb) {
                    this.action = cb;
                    return this;
                },
                'enter': function (cbs) {
                    if (!this.do_enter) {
                        this.do_enter = [];
                    }
                    if (_.isArray(cbs)) {
                        this.do_enter = this.do_enter.concat(cbs);
                    } else {
                        this.do_enter.push(cbs);
                    }
                    return this;
                },
                'exit': function (cb) {
                    this.do_exit = cb;
                    return this;
                },
                'run': function (parsed) {
                    var halt_execution = false;

                    if (this.hasOwnProperty('do_enter')) {
                        halt_execution = !!_.find(this.do_enter, function (cb) {
                            return cb.call(this, parsed) === false;
                        }, this);
                    }

                    if (!halt_execution && this.hasOwnProperty('action')) {
                        this.action(parsed);
                    }
                }
            },
            rescueCb = function () {
                // TODO: some defaults
            },
            registered = {},
            onPopState = function () {
                var initialPop = !historyInitial.popped && location.href === historyInitial.URL;

                historyInitial.popped = true;
                if (initialPop) {
                    return;
                }
                dispatch(location.pathname + location.search);
            },
            match = function (path) {
                var parsedRoute,
                    susaninMatched = _.find(registered, function (item) {
                        parsedRoute = item.match(path);
                        return parsedRoute !== null;
                    });
                if (parsedRoute) {
                    return {
                        parsed: parsedRoute,
                        matched: susaninMatched
                    };
                }
                return null;
            },
            dispatch = function (passedRoute) {
                var previousRoute, matchedResult;
                if (current === passedRoute) {
                    return;
                }
                previous = current;
                current = passedRoute;

                matchedResult = match(passedRoute);

                if (previous) {
                    previousRoute = match(previous);
                    if (previousRoute !== null && previousRoute.matched.hasOwnProperty('do_exit') && previousRoute.matched.do_exit) {
                        previousRoute.matched.do_exit(previousRoute.parsed);
                    }
                }

                if (matchedResult !== null) {
                    matchedResult.matched.run(matchedResult.parsed);
                    return true;
                }
                if (rescueCb !== null) {
                    rescueCb(passedRoute);
                }
            };

        // public interface
        var listen = function () {
                if (!supported()) {
                    return false;
                }
                historyInitial.popped = (('state' in window.history) ? true : false);
                historyInitial.URL = location.href;
                window.onpopstate = onPopState;
                return true;
            },
            /**
             * return susanin route which extends with pathjs-like members
             * @param params - that is susanin route params or path pattern
             */
            map = function (params) {
                var result = _.extend(new SusaninRoute(params), extenderRoute),
                    propName = params.name || params.pattern || params;
                registered[propName] = result;
                return result;
            },
            rescue = function (cb) {
                rescueCb = cb;
            },
            pushState = function (state, title, path) {
                if (dispatch(path)) {
                    history.pushState(state, title, path);
                }
            },
            supported = function () {
                return !!(window.history && window.history.pushState);
            },
            disabled = function () {
                var query = location.search,
                    result = false, i, iLen, parts;
                if (query) {
                    query = query.substring(1);
                    query = query.split('&');
                    for (i = 0, iLen = query.length; i < iLen; i++) {
                        parts = query[i].split('=');
                        if (parts && parts.length && parts[0] === 'no-route') {
                            result = true;
                            break;
                        }
                    }
                }
                return result;
            };

        return {
            map: map,
            rescue: rescue,
            pushState: pushState,
            mapped: registered,
            listen: listen,
            supported: supported,
            disabled: disabled
        };
    });