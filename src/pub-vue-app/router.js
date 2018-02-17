import VueRouter from 'vue-router';
import routesMap from '../../config/routes-map.json';
import App from './pub-vue-app.vue';

import ComponentEmpty from './component-empty.vue';
import Page404 from './page-404.vue'
import IndexPageComponent from './pages/page-index/page-index.vue';
import PostPageComponent from './pages/page-post/page-post.vue';

function createRouter({Vue}) {
    Vue.use(VueRouter);

    return new VueRouter({
        fallback: false,
        base: '/ssr/',
        mode: 'history',
        scrollBehavior(to, from, savedPosition) {
            if (savedPosition) {
                return savedPosition;
            }

            let scrollToAnchorRoute = to.matched.find(m => !!m.meta.scrollToAnchor);
            let scrollToAnchor = scrollToAnchorRoute ? scrollToAnchorRoute.meta.scrollToAnchor : null;
            // FIXME incorrect scroll because of async loading data
            if (document.querySelector(scrollToAnchor)) {
                return {
                    selector: scrollToAnchor
                };
                // return new Promise(resolve => {
                //     setTimeout(() => {
                //         resolve({
                //             selector: scrollToAnchor
                //         });
                //     }, 1000);
                // })
            }
            // if (scrollToAnchor) {
            // return {
            //     selector: scrollToAnchor
            // };
            // return {
            //     x: 0,
            //     y: 220
            // }
            // }

            return false;
        },
        routes: [
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
                        },
                        meta: {
                            scrollToAnchor: '#scroll-anchor'
                        }
                    },
                    {
                        name: 'Tag',
                        path: routesMap.tag + '/:tagId',
                        components: {
                            mainContent: ComponentEmpty
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
        ]
    });
}

export {
    createRouter
};