import VueRouter from 'vue-router';
import routesMap from '../../config/routes-map.json';
import App from './pub-vue-app.vue';

import ComponentEmpty from './component-empty.vue';
import Page404 from './page-404.vue'
import IndexPageComponent from './pages/page-index/page-index.vue';
import PostPageComponent from './pages/page-post/page-post.vue';
import TagPageComponent from './pages/page-tag/page-tag.vue';
import isBrowser from 'is-in-browser';

const routes = [
    {
        path: '/',
        component: App,
        children: [
            {
                name: 'Index',
                path: '',
                components: {
                    mainContent: IndexPageComponent
                }
            },
            {
                name: 'Post',
                path: routesMap.post + '/:postId',
                components: {
                    mainContent: PostPageComponent
                }
            },
            {
                name: 'Tag',
                path: routesMap.tag + '/:tagId',
                components: {
                    mainContent: TagPageComponent
                }
            },
            {
                path: '*',
                components: {
                    mainContent: Page404
                }
            }
        ]
    }
];

function setupHooks(router) {
    router.afterEach((to, from) => {
        // Google analytics
        if (isBrowser && ga) {
            setTimeout(function () {
                ga('send', 'pageview', to.fullPath);
            }, 250);
        }
    });
    return router;
}

function createRouter({Vue}) {
    Vue.use(VueRouter);

    const routerInstance = new VueRouter({
        fallback: false,
        // base: '/ssr/',
        base: '/',
        mode: 'history',
        scrollBehavior(to, from, savedPosition) {
            if (savedPosition) {
                return savedPosition;
            }

            // scroll in SCROLL_TO handler - after get data

            return false;
        },
        routes
    });

    setupHooks(routerInstance);

    return routerInstance;
}

export {
    createRouter
};