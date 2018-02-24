/**
 * Init polyfills
 */
require('core-js/es6/array');
require('core-js/es6/promise');
require('core-js/es6/object');
require('core-js/es6/symbol');

import {createApp} from './app';

import resources from 'jb-resources';

// Специфичная для клиента логика загрузки...

const langFromMarkup = document.getElementsByTagName('html')[0].lang || 'en';
const initialState = window.__INITIAL_STATE__;

// const {app, router, store} = createApp({initialState, resources, language: langFromMarkup});

createApp({initialState, resources, language: langFromMarkup})
    .then(null, err => console.error('Sorry, couldn\'t create app: ', err));

// предполагается, что у корневого элемента в шаблоне App.vue есть элемент с `id="app"`
// app.$mount('#vue-app');