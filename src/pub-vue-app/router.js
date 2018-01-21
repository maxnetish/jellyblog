import VueRouter from 'vue-router';
import routesMap from '../../config/routes-map.json';
import App from './pub-vue-app.vue';

import ComponentEmpty from './component-empty.vue';
import Page404 from './page-404.vue'

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
                            mainContent: ComponentEmpty,
                            footer: ComponentEmpty
                        }
                    },
                    {
                        name: 'Post',
                        path: routesMap.post + '/:postId',
                        components: {
                            mainContent: ComponentEmpty,
                            footer: ComponentEmpty
                        }
                    },
                    {
                        name: 'Tag',
                        path: routesMap.tag + '/:tagId',
                        components: {
                            mainContent: ComponentEmpty,
                            footer: ComponentEmpty
                        }
                    },
                    {
                        path: '*',
                        components: {
                            mainContent: Page404,
                            footer: ComponentEmpty
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