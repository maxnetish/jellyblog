import VueRouter from 'vue-router';
import routesMap from '../../config/routes-map.json';
import App from './pub-vue-app.vue';

import ComponentEmpty from './component-empty.vue';
import Page404 from './page-404.vue'
import IndexComponent from './pages/page-index/page-index.vue';

function createRouter({Vue}) {
    Vue.use(VueRouter);

    return new VueRouter({
        fallback: false,
        base: '/ssr/',
        mode: 'history',
        routes: [
            {
                path: '/',
                component: App,
                children: [
                    {
                        name: 'Index',
                        path: '',
                        components: {
                            mainContent: IndexComponent
                        }
                    },
                    {
                        name: 'Post',
                        path: routesMap.post + '/:postId',
                        components: {
                            mainContent: ComponentEmpty
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