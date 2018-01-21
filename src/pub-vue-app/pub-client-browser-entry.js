import {createApp} from './app';

import resources from 'jb-resources';

// Специфичная для клиента логика загрузки...
const langFromMarkup = document.getElementsByTagName('html')[0].lang || 'en';
const initialState = window.__INITIAL_STATE__;

const {app, router, store} = createApp({initialState, resources, language: langFromMarkup});

// предполагается, что у корневого элемента в шаблоне App.vue есть элемент с `id="app"`
// app.$mount('#vue-app');