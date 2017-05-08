/**
 * Init polyfills
 */
require('core-js/es6/array');
require('core-js/es6/promise');
require('core-js/es6/object');
require('core-js/es6/symbol');

import resource from './resources';

// resource.post.get({id: props.params.postId});

import Vue from 'vue';
import VueRouter from 'vue-router';
import App from './admin-vue-app/admin-vue-app.vue';

Vue.use(VueRouter);

new Vue({
    el: '#vue-app',
    render: h => h(App)
});