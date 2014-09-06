/**
 * Created by mgordeev on 04.09.2014.
 */
define('view-transition',
    [
        'jquery'
    ], function ($) {
        'use strict';
        var transitionPhaseOneClass = 'trans-phase-1',
            transitionPhaseTwoClass = 'trans-phase-2',
            transitionPhaseThreeClass = 'trans-phase-3',
            eventNames = {
                'transition': 'transitionend',
                'OTransition': 'oTransitionEnd',
                'WebkitTransition': 'webkitTransitionEnd',
                'MozTransition': 'transitionend'
            },
            detectEventName = function () {
                var result, prop;
                for (prop in eventNames) {
                    if (typeof(document.body.style[prop]) != 'undefined') {
                        result = eventNames[prop];
                        break;
                    }
                }
                return result;
            },
            transitionEndEventName = detectEventName();

    });