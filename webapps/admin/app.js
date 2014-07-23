/**
 * Created by Gordeev on 21.07.2014.
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
            'ko',
            'jquery',
            'binding.ko-translate',
            'router'
        ],
        function (ko, $) {
            //init routes

            //init non-rout parts
            console.log('apply binding to nav...');
            ko.applyBindings({}, $('#main-nav').get(0));
        });

//    var foo = require(['testModule'], function(tm){
//        console.dir(tm);
//    });

})();