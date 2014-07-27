/**
 * Created by Gordeev on 26.07.2014.
 */
define('vm.main-nav',
    [
        'route-definition'
    ],
    function (routes) {

        var navlinks = [
            {
                href: '/',
                target: '_blank',
                titleKey: 'BLOG'
            },
            {
                href: '/auth/logout',
                titleKey: 'LOGOUT'
            },
            {
                href: '#!/posts',
                titleKey: 'POSTS',
                icon: 'glyphicon-th-list'
            },
            {
                href: routes.definitions.misc.route,
                titleKey: 'MISC',
                icon: 'glyphicon-adjust'
            },
            {
                href: routes.definitions.files.route,
                titleKey: 'FILES',
                icon: 'glyphicon-folder-open'
            },
            {
                href: '#!/edit',
                titleKey: 'NEW_POST',
                icon: 'glyphicon-plus'
            }
        ];

        return {
            navlinks: navlinks
        };
    });