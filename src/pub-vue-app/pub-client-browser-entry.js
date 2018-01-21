import {createApp} from './app';
import {createStore} from "./store";
import {createRouter} from './router';

import Vue from "vue";
import resources from 'jb-resources';

// Специфичная для клиента логика загрузки...
const router = createRouter();
const store = createStore();

// hydration
if (window.__INITIAL_STATE__) {
    store.replaceState(window.__INITIAL_STATE__);
}

// hook for vuex store filling
Vue.mixin({
    beforeCreate() {
        // Hook calls in client and server
        const {asyncData} = this.$options;
        if (asyncData) {
            asyncData({
                store: this.$store,
                route: this.$route,
                resources
            });
        }
    }
});

// hook for vuex store filling
Vue.mixin({
    beforeRouteUpdate(to, from, next) {
        // hook calls only in client
        const {asyncData} = this.$options;
        if (asyncData) {
            asyncData({
                store: this.$store,
                route: to,
                beforeRouteUpdateHook: true,
                resources
            })
                .then(next)
                .then(null, next);
        } else {
            next();
        }
    }
});

// We should run app _after_ hydration
const app = createApp({router, store});

// предполагается, что у корневого элемента в шаблоне App.vue есть элемент с `id="app"`
// app.$mount('#vue-app');