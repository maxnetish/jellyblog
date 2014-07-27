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
            'moment',
            'vm.main-nav',
            'binding.ko-translate',
            'binding.ko-datetext',
            'router'
        ],
        function (ko, $, moment, vmMainNav) {
            //init routes

            //init momen
            moment.lang(window.navigator.userLanguage || window.navigator.language);

            //init non-rout parts
            console.log('apply binding to nav...');
            ko.applyBindings(vmMainNav, $('#main-nav').get(0));
        });

//    var foo = require(['testModule'], function(tm){
//        console.dir(tm);
//    });

})();