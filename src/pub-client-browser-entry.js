import {createApp} from './pub-vue-app/app';

// Специфичная для клиента логика загрузки...
const {app} = createApp();

// предполагается, что у корневого элемента в шаблоне App.vue есть элемент с `id="app"`
app.$mount('#vue-app');