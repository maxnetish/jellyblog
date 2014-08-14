/**
 * Created by mgordeev on 14.08.2014.
 */
(function () {
    require.config({
        waitSeconds: 45,
        baseUrl: '/js',
        paths: {
            ko: "knockout",
            _: "lodash",
            q: "q"
        }
    });

    require(
        [
            'show-full-content'
        ],
        function (showFullContent) {
            //bind event handlers
            showFullContent.bind();
        });
})();