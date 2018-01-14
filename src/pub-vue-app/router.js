import Vue from 'vue';
import VueRouter from 'vue-router';
import App from './pub-vue-app.vue';

Vue.use(VueRouter);

function createRouter() {
    return new VueRouter({
        mode: 'history',
        routes: [
            {
                path: '/',
                component: App
            }
        ]
    });
}

export {
    createRouter
};