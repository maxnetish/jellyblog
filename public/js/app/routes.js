/**
 * Created by mgordeev on 17.06.2014.
 */
angular.module('jellyRoutes',
    [
        'ngRoute',
        'jellyControllers'
    ])
    .constant('ROUTE_PATHS', {
        POSTS: '/posts/'
    });