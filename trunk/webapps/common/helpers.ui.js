/**
 * Created by mgordeev on 20.08.2014.
 */
define('helpers-ui',
    [
        'jquery'
    ],
    function ($) {
        'use strict';

        var isDocumentHidden = function () {
                var doc = window.document,
                    standardHidden = doc.hidden,        //Firefox, EI>=10
                    webkitHidden = doc.webkitHidden;    //Chrome
                return standardHidden || webkitHidden;
            },

            isElementInViewport = function ($element, fullVisible) {
                var $window = $(window),
                    viewport = {
                        top: $window.scrollTop(),
                        left: $window.scrollLeft()
                    },
                    bounds;
                viewport.right = viewport.left + $window.width();
                viewport.bottom = viewport.top + $window.height();

                bounds = $element.offset();
                bounds.right = bounds.left + $element.outerWidth();
                bounds.bottom = bounds.top + $element.outerHeight();

                if (fullVisible) {
                    return viewport.top <= bounds.top
                        && viewport.right >= bounds.right
                        && viewport.left <= bounds.left
                        && viewport.bottom >= bounds.bottom;
                }
                return (!(viewport.right < bounds.left
                    || viewport.left > bounds.right
                    || viewport.bottom < bounds.top
                    || viewport.top > bounds.bottom));
            },
            scrollToTop = function () {
                $(window).scrollTop(0);
            };

        return {
            isDocumentHidden: isDocumentHidden,
            isElementInViewport: isElementInViewport,
            scrollToTop: scrollToTop
        };
    });