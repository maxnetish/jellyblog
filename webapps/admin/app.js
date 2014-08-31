/**
 * Created by Gordeev on 21.07.2014.
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
        paths: actualPaths,
        shim: {
            // jquery plugin
            'select2': ['jquery']
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
            'binding.ko-datevalue',
            'binding.ko-listtext',
            'binding.ko-select2',
            'router'
        ],
        function (ko, $, moment, vmMainNav) {
            //init routes

            //init momen
            moment.lang($('html').data('jb-locale') || window.window.navigator.userLanguage || window.navigator.language);

            //init non-rout parts
            ko.applyBindings(vmMainNav, $('#main-nav').get(0));
        });

//    var foo = require(['testModule'], function(tm){
//        console.dir(tm);
//    });

})();