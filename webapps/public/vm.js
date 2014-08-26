/**
 * Created by mgordeev on 26.08.2014.
 */
define('vm',
    [
        'ko',
        'route-definition',
        'jquery'
    ],
    function(ko, RouteDefinition, $){
        var posts = ko.observableArray();
        var pager = {
            urlNewer: ko.observable(),
            urlOlder: ko.observable()
        };

        var enterRoot = function(params){
            // params can be:
            // skip
            // tag
            console.dir(params);

            $.ajax({
                dataType: "json",
                url: '/',
                data: params,
                type: 'GET'
            }).done(function(result){
                console.dir(result);
            }).fail(function(){

            }).always(function(){

            });
        };

        var routes = Object.freeze({
            root: new RouteDefinition({
                route: '/',
                enter: enterRoot
            })
        });



        return {
            routes: routes,
            pager: pager,
            posts: posts
        };
    });