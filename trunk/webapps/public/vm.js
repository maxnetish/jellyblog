/**
 * Created by mgordeev on 26.08.2014.
 */
define('vm',
    [
        'ko',
        'route-definition',
        'jquery',
        'messenger'
    ],
    function (ko, RouteDefinition, $, messenger) {
        var posts = ko.observableArray();
        var pager = {
            urlNewer: ko.observable(),
            urlOlder: ko.observable()
        };
        var disableCut = ko.observable(false);
        var disablePermalink = ko.observable(false);

        var updateVmInternal = function (data) {
            // sanitize:
            data = data || {};
            data.pager = data.pager || {};
            data.postList = data.postList || [];

            pager.urlNewer(data.pager.urlNewer);
            pager.urlOlder(data.pager.urlOlder);
            posts(data.postList);
            disableCut(data.disableCut);
            disablePermalink(data.disablePermalink);

            document.title = data.pageTitle;

            messenger.publish(messenger.messageNames.ContentUpdated);
        };

        var enterRoot = function (params, applyBinding) {
            $.ajax({
                dataType: "json",
                url: '/api/vm',
                data: params,
                type: 'GET'
            }).done(function (result) {
                updateVmInternal(result);
                applyBinding();
            });
        };

        var enterPostSlug = function (params, applyBinding) {
            $.ajax({
                dataType: "json",
                url: '/api/vm/post/' + params.slug,
                type: 'GET'
            }).done(function (result) {
                updateVmInternal(result);
                applyBinding();
            });
        };

        var enterPostId = function (params, applyBinding) {
            $.ajax({
                dataType: "json",
                url: '/api/vm/post',
                data: params,
                type: 'GET'
            }).done(function (result) {
                updateVmInternal(result);
                applyBinding();
            });
        };

        var routes = Object.freeze({
            root: new RouteDefinition({
                route: '/',
                enter: enterRoot
            }),
            postSlug: new RouteDefinition({
                route: '/post/<slug>',
                enter: enterPostSlug
            }),
            postId: new RouteDefinition({
                route: '/post',
                enter: enterPostId
            })
        });

        return {
            routes: routes,
            pager: pager,
            posts: posts,
            disableCut: disableCut,
            disablePermalink: disablePermalink
        };
    });