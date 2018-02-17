import Vue from 'vue';
import {createRouter} from './router';
import {createStore} from "./store";
import {createGetTextFilter} from "./filters/get-text";
import {createLocaleDatetimeFilter} from './filters/date-to-locale-string';
import {createDatetimeToIsoFilter} from './filters/date-to-iso-string';

function registerGlobals({resources, language}){
    // hook for vuex store filling
    Vue.mixin({
        beforeCreate() {
            // Hook calls in client and server
            const {asyncData, name} = this.$options;
            if (asyncData) {
                console.log('before create hook with ' + name);
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
            const {asyncData, name} = this.$options;
            if (asyncData) {
                console.log('before route update hook with ' + name);
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

    Vue.filter('get-text', createGetTextFilter(language));
    Vue.filter('locale-datetime', createLocaleDatetimeFilter(language));
    Vue.filter('date-to-iso-string', createDatetimeToIsoFilter());
}

function createApp({initialState, resources, language}) {

    const router = createRouter({Vue});
    const store = createStore({Vue});

    // hydration (_before_ app instantiate!)
    if (initialState) {
        store.replaceState(initialState);
    }

    registerGlobals({resources, language});

    const app = new Vue({
        // внедряем маршрутизатор в корневой экземпляр Vue
        router,
        store,
        el: '#vue-app',
        render (h) {
            return h('router-view');
        }
    });

    // возвращаем и приложение и маршрутизатор и хранилище
    return {app, router, store};
}

export {
    createApp
};