import Vue from 'vue';
import {createRouter} from './router';
import {createStore} from "./store";
import fontawesome from '@fortawesome/fontawesome';
import routeUpdateHooksPlugin from './plugins/route-update-hooks';
import dateToIsoFilterPlugin from './filters/date-to-iso-string';
import dateToLocaleStringFilterPlugin from './filters/date-to-locale-string';
import getTextFilterPlugin from './filters/get-text';
// import clientManifest from '/vue-ssr-client-manifest.json';


// to not inject fontawesome support styles into html header
// See src/less-pub/utils.less
fontawesome.config = {
    autoAddCss: false
};

// renderSide: ['BROWSER' | 'SERVER']
function createApp({initialState, resources, language, renderSide = 'BROWSER'} = {}) {

    const router = createRouter({Vue});

    // // install plugins
    // if(renderSide === 'BROWSER') {
    //     // very severity: didn't use global hooks on server rendering
    //     Vue.use(routeUpdateHooksPlugin, {resources});
    // }
    Vue.use(dateToIsoFilterPlugin);
    Vue.use(dateToLocaleStringFilterPlugin);
    Vue.use(getTextFilterPlugin);

    return createStore({Vue, language, importStatics: !initialState})
        .then(store => {
            // hydration (_before_ app instantiate!)
            if (initialState) {
                store.replaceState(initialState);
            }
            if(renderSide === 'BROWSER') {
                // very severity: didn't use global hooks on server rendering
                Vue.use(routeUpdateHooksPlugin, {resources});
            }
            const app = new Vue({
                // внедряем маршрутизатор в корневой экземпляр Vue
                router,
                store,
                el: '#vue-app',
                render(h) {
                    return h('router-view');
                }
            });
            // возвращаем и приложение и маршрутизатор и хранилище
            return {app, router, store};
        });
}

export {
    createApp
};