/**
 * Created by mgordeev on 20.08.2014.
 */
define('deferred-image-loader',
    [
        'jquery',
        'lodash',
        'helpers-ui'
    ],
    function ($, _, helpersUi) {
        'use strict';
        var loaderDataAttr = 'deferred-src',
            classInitial = 'deferred-image-wait',
            classAfterLoad = 'deferred-image-loaded',
            nameSpace = '.jbImageLoader',
            onLoad = function (e) {
                var $elem = $(e.target);
                $elem.addClass(classAfterLoad);
            },
            doLoad = function (elem) {
                var $elem = $(elem),
                    src = $elem.data(loaderDataAttr);

                $elem.one('load', onLoad).one('error', onLoad).attr('src', src).removeClass(classInitial);
            },
            checkForVisible = function (elem) {
                var $elem;
                if (helpersUi.isDocumentHidden()) {
                    return false;
                }

                $elem = $(elem);
                if (!$elem.is(':visible')) {
                    return false;
                }

                return helpersUi.isElementInViewport($elem, false);
            },
            onScrollOrResize = function () {
                var $targetElems = $('.' + classInitial);
                if (!$targetElems.length) {
                    $(window).off(nameSpace);
                }
                $targetElems.each(function () {
                    if (checkForVisible(this)) {
                        doLoad(this);
                    }
                });
            };

        (function () {
            onScrollOrResize();
            $(window)
                .on('scroll' + nameSpace, _.throttle(onScrollOrResize, 1000, {'leading': false}))
                .on('resize' + nameSpace, _.throttle(onScrollOrResize, 1000, {'leading': false}));
        })();
    });