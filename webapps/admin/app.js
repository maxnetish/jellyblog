/**
 * Created by Gordeev on 21.07.2014.
 */
(function () {
    require.config({
        waitSeconds: 45,
        baseUrl: '/js',
        paths: {
            ko: "knockout",
            _: "lodash"
        }
    });

    require([
        'router'
    ], function () {
        //init routes
    });

    var foo = require(['testModule'], function(tm){
        console.dir(tm);
    });

})();