/**
 * Init polyfills
 */
require('core-js/es6/array');
require('core-js/es6/promise');
require('core-js/es6/object');
require('core-js/es6/symbol');

import Vue from 'vue';
import './filters';
import './components';
import {createRouter} from './routes';
import {createRootStore} from './store';

const router = createRouter();
const store = createRootStore();

// Use vue router
// Vue.use(VueRouter);

// run up
const app = new Vue({
    router,
    el: '#vue-app',
    store,
    render (h) {
        return h('router-view');
    }
});

export default app;

// Quazar http://quasar-framework.org/