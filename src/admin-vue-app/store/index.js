import Vue from 'vue';
import Vuex from 'vuex';

import actions from './actions';

const debug = process.env.NODE_ENV !== 'production';

Vue.use(Vuex);

function createRootStore() {
    const store = new Vuex.Store({
        actions,
        strict: debug
    });
    return store;
}

// hook for vuex store filling
Vue.mixin({
    beforeCreate() {
        // Hook calls in client and server
        const {asyncData} = this.$options;
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
    beforeRouteUpdate(to, from, next) {
        // hook calls only in client
        const {asyncData} = this.$options;
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


export {
    createRootStore
};