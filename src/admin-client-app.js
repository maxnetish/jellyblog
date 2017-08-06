/**
 * Init polyfills
 */
require('core-js/es6/array');
require('core-js/es6/promise');
require('core-js/es6/object');
require('core-js/es6/symbol');

import Vue from 'vue';
import VueRouter from 'vue-router';
import './admin-vue-app/filters';
import './admin-vue-app/components';
import App from './admin-vue-app/admin-vue-app.vue';
import OptionsPage from './admin-vue-app/pages/options/options.vue';
import PostsPage from './admin-vue-app/pages/posts/posts.vue';
import PostPage from './admin-vue-app/pages/post/post.vue';


const router = new VueRouter({
    routes: [
        {
            path: '/',
            component: App,
            children: [
                {
                    path: '',
                    name: 'root_entry',
                    redirect: {
                        name: 'options'
                    }
                },
                {
                    path: 'options',
                    name: 'options',
                    component: OptionsPage
                },
                {
                    path: 'posts',
                    name: 'posts',
                    component: PostsPage,
                    props: route => ({
                        page: parseInt(route.query.p, 10) || 1,
                        searchParameters: {
                            fullText: route.query.q,
                            dateFrom: route.query.from,
                            dateTo: route.query.to
                        }
                    })
                },
                {
                    path: 'post',
                    name: 'post',
                    component: PostPage,
                    props: route => ({id: route.query.id})
                }
            ]
        }
    ]
});

Vue.use(VueRouter);

const app = new Vue({
    router,
    el: '#vue-app',
    render (h) {
        return h('router-view');
    }
});

export default app;