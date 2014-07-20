/**
 * Created by mgordeev on 17.06.2014.
 */
angular.module('jellyRoutesAdmin',
    [
        'ngRoute',
        'jellyControllersAdmin'
    ])
    .constant('ROUTE_PATHS', {
        POSTS: '/posts/:query?',
        EDIT: '/edit/:postId?',
        MISC: '/misc',
        FILES: '/files/:query?'
    })
    .config(
    [
        '$locationProvider',
        function ($locationProvider) {
            $locationProvider.hashPrefix('!');
        }
    ])
    .config(
    [
        '$routeProvider',
        'ROUTE_PATHS',
        function ($routeProvider, paths) {
            $routeProvider
                .when(paths.MISC, {
                    templateUrl: '/partials/admin-misc',
                    controller: 'miscController'
                })
                .when(paths.POSTS, {
                    templateUrl: '/partials/admin-posts',
                    controller: 'postsController'
                })
                .when(paths.EDIT, {
                    templateUrl: '/partials/admin-edit-post',
                    controller: 'postController'
                })
                .when(paths.FILES, {
                    templateUrl: '/partials/admin-files',
                    controller: 'filesController'
                })
                .otherwise({
                    redirectTo: '/posts'
                });
        }
    ])