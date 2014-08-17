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
            'show-full-content',
            'susanin-path',
            'jquery'
        ],
        function (showFullContent, path, $) {
            //bind event handlers
            showFullContent.bind();

            // demo path:
            path.map('/demo/another')
                .enter(function (parsed) {
                    console.log('enter url /demo/another');
                    console.dir(parsed);
                })
                .to(function (parsed) {
                    console.log('to url /demo/another');
                    console.dir(parsed);
                })
                .exit(function (parsed) {
                    console.log('exit url /demo/another');
                    console.dir(parsed);
                });
            path.map('/demo')
                .enter(function (parsed) {
                    console.log('enter url /demo');
                    console.dir(parsed);
                })
                .to(function (parsed) {
                    console.log('to url /demo');
                    console.dir(parsed);
                })
                .exit(function (parsed) {
                    console.log('exit url /demo');
                    console.dir(parsed);
                });
            path.rescue(function (path) {
                // try to load from server
                console.log('Rescue path: ' + path);
            });
            path.listen(); // no fallback to hashbangs
            $('body').on('click', 'a[data-route]', function (e) {
                var $this = $(this),
                    urlAttr = $this.data('route') || 'href',
                    href = $this.attr(urlAttr);
                if (href) {
                    e.preventDefault();
                    path.pushState(null, null, href);
                }
            });


        });
})();