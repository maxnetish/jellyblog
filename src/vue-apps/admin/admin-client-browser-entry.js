/**
 * Init polyfills
 */

// Need for dynamic imports
import 'core-js/modules/es6.promise';
import 'core-js/es6/array';
import 'core-js/es6/object';
import 'core-js/es6/symbol';

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