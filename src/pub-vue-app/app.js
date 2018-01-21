import Vue from 'vue';

function createApp({router, store}) {
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
    return app;
}

export {
    createApp
};