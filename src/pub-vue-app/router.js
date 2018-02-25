import VueRouter from 'vue-router';
import routesMap from '../../config/routes-map.json';
import App from './pub-vue-app.vue';

import ComponentEmpty from './component-empty.vue';
import Page404 from './page-404.vue'
import IndexPageComponent from './pages/page-index/page-index.vue';
import PostPageComponent from './pages/page-post/page-post.vue';
import TagPageComponent from './pages/page-tag/page-tag.vue';

function createRouter({Vue}) {
    Vue.use(VueRouter);

    return new VueRouter({
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
        ]
    });
}

export {
    createRouter
};