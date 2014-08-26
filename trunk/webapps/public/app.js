/**
 * Created by mgordeev on 14.08.2014.
 */
(function () {
    require.config({
        waitSeconds: 45,
        baseUrl: '/js',
        paths: {
            ko: "knockout.min",
            _: "lodash.min",
            q: "q.min"
        }
    });

    require(
        [
            'deferred-image-loader',
            'show-full-content',
            'router',
            'jquery'
        ],
        function (imageLoader, showFullContent) {
            //bind event handlers
            showFullContent.bind();



        });
})();