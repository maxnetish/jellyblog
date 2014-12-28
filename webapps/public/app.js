/**
 * Created by mgordeev on 14.08.2014.
 */
(function () {
    var devmode = !!window.jb_developmentMode;
    var devPaths = {
            ko: "knockout",
            _: "lodash",
            q: "q",
            jquery: 'jquery',
            moment: 'moment-with-langs',
            path: 'path',
            select2: 'select2'
        },
        prodPaths = {
            ko: "knockout.min",
            _: "lodash.min",
            q: "q.min",
            jquery: 'jquery.min',
            moment: 'moment-with-langs.min',
            path: 'path.min',
            select2: 'select2.min'
        },
        actualPaths = devmode ? devPaths : prodPaths;


    require.config({
        waitSeconds: 45,
        baseUrl: '/js',
        paths: actualPaths
//        select2 не задействовано здесь
//        shim: {
//            // jquery plugin
//            'select2': ['jquery']
//        }
    });

    require(
        [
            'polyfill',
            'deferred-image-loader',
            'show-full-content',
            'router',
            'google-analytics'
        ],
        function (polyfill, imageLoader, showFullContent, router, googleAnalytics) {
            // run up
            polyfill.add();
            imageLoader.bind();
            showFullContent.bind();
            router.run();
            googleAnalytics.init();
        });
})();