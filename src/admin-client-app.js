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
import FilesPage from './admin-vue-app/pages/files/files.vue';

import toInteger from 'lodash/toInteger';


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
                        page: toInteger(route.query.p) || 1,
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
                },
                {
                    path: 'files',
                    name: 'files',
                    component: FilesPage,
                    props: route => ({
                        page: toInteger(route.query.p) || 1,
                        searchParameters: {
                            context: route.query.c,
                            contentType: route.query.t,
                            dateTo: route.query.to,
                            dateFrom: route.query.from
                        }
                    })
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