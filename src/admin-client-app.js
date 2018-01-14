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
import Log from './admin-vue-app/pages/log/log.vue';


import store from './admin-vue-app/store';


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
                    component: PostsPage
                },
                {
                    path: 'post',
                    name: 'post',
                    component: PostPage
                },
                {
                    path: 'files',
                    name: 'files',
                    component: FilesPage
                },
                {
                    path: 'log',
                    name: 'log',
                    component: Log
                }
            ]
        }
    ]
});

Vue.use(VueRouter);

// hook for vuex store filling
Vue.mixin({
    beforeCreate () {
        // Hook calls in client and server
        const { asyncData } = this.$options;
        if (asyncData) {
            asyncData({
                store: this.$store,
                route: this.$route
            });
        }
    }
});

// hook for vuex store filling
Vue.mixin({
    beforeRouteUpdate (to, from, next) {
        // hook calls only in client
        const { asyncData } = this.$options;
        if (asyncData) {
            asyncData({
                store: this.$store,
                route: to,
                beforeRouteUpdateHook: true
            })
                .then(next)
                .then(null, next);
        } else {
            next();
        }
    }
});

const app = new Vue({
    router,
    el: '#vue-app',
    store,
    render (h) {
        return h('router-view');
    }
});

export default app;