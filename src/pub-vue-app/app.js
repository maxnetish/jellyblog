import Vue from 'vue';
import App from './pub-vue-app.vue';
import {createRouter} from './router';
import {createStore} from "./store";

// экспортируем функцию фабрику для создания экземпляров
// нового приложения, маршрутизатора и хранилища
function createApp() {
    // Создаём экземпляр маршрутизатора и хранилища
    const router = createRouter();
    const store = createStore();

    const app = new Vue({
        // внедряем маршрутизатор в корневой экземпляр Vue
        router,
        store,
        render: h => h(App)
    });

    // возвращаем и приложение и маршрутизатор и хранилище
    return {app, router, store};
}

export {
    createApp
};