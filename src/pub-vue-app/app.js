import Vue from 'vue';
import {createRouter} from './router';
import {createStore} from "./store";
import {registerAsync as registerFilters} from './filters';
import fontawesome from "@fortawesome/fontawesome";

// to not inject fontawesome support styles into html header
// See src/less-pub/utils.less
fontawesome.config = {
    autoAddCss: false
};

function registerGlobals({resources, language, renderSide}) {
    // sync globals
    // hook for vuex store filling
    Vue.mixin({
        beforeCreate() {
            // Hook calls in client and server
            // We need this hook only in browser
            if (this.$isServer) {
                return;
            }
            const {asyncData, name, scrollToAfterFetchData} = this.$options;
            const {$root} = this;
            if (asyncData) {
                Promise.resolve(asyncData({
                    store: this.$store,
                    route: this.$route,
                    resources
                }))
                    .then((res) => {
                        if (res && scrollToAfterFetchData) {
                            $root.$emit('SCROLL_TO', scrollToAfterFetchData);
                        }
                        return res;
                    });
            }
        },
        beforeRouteUpdate(to, from, next) {
            // hook calls only in client
            const {asyncData, name, scrollToAfterFetchData} = this.$options;
            const {$root} = this;
            if (asyncData) {
                Promise.resolve(asyncData({
                    store: this.$store,
                    route: to,
                    beforeRouteUpdateHook: true,
                    resources
                }))
                    .then((res => {
                        if (res && scrollToAfterFetchData) {
                            $root.$emit('SCROLL_TO', scrollToAfterFetchData);
                        }
                        return res;
                    }))
                    .then(res => {
                        next();
                        return res;
                    })
                    .then(null, next);
            } else {
                next();
            }
        },
        data() {
            return {
                renderSide: renderSide
            };
        }
    });

    return registerFilters(Vue, {language});
}

function registerRootEvents({app}) {
    // to smoothly scroll to element after fetch page data
    app.$on('SCROLL_TO', function (scrollToSelector) {
        if (!scrollToSelector) {
            return;
        }
        let scrollToEl = document.querySelector(scrollToSelector);
        if (!scrollToEl) {
            return;
        }
        scrollToEl.scrollIntoView({
            block: 'start',
            inline: 'nearest',
            behavior: 'smooth'
        });
    })
}

// renderSide: ['BROWSER' | 'SERVER']
function createApp({initialState, resources, language, renderSide = 'BROWSER'} = {}) {

    const router = createRouter({Vue});
    const store = createStore({Vue});

    // hydration (_before_ app instantiate!)
    if (initialState) {
        store.replaceState(initialState);
    }

    return registerGlobals({resources, language, renderSide})
        .then(() => {
            const app = new Vue({
                // внедряем маршрутизатор в корневой экземпляр Vue
                router,
                store,
                el: '#vue-app',
                render(h) {
                    return h('router-view');
                }
            });
            registerRootEvents({app});
            // возвращаем и приложение и маршрутизатор и хранилище
            return {app, router, store};
        });
}

export {
    createApp
};