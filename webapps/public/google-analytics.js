/**
 * Created by Gordeev on 28.12.2014.
 */
define('google-analytics',
    [],
    function () {
        var initFn = function () {
            var gaId = window.jb_googleAnalyticsId;

            if(!gaId){
                return;
            }

            (function (i, s, o, g, r, a, m) {
                i['GoogleAnalyticsObject'] = r;
                i[r] = i[r] || function () {
                    (i[r].q = i[r].q || []).push(arguments)
                }, i[r].l = 1 * new Date();
                a = s.createElement(o), m = s.getElementsByTagName(o)[0];
                a.async = 1;
                a.src = g;
                m.parentNode.insertBefore(a, m)
            })(window, document, 'script', '//www.google-analytics.com/analytics.js', 'ga');

            ga('create', gaId, 'auto');
            ga('send', 'pageview');
        };

        return {
            init: initFn
        };
    });