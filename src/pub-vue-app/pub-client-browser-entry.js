/**
 * Init polyfills
 */
require('core-js/es6/array');
require('core-js/es6/promise');
require('core-js/es6/object');
require('core-js/es6/symbol');

import {createApp} from './app';
import resources from 'jb-resources';
import pubSettings from '../../config/pub-settings.json';
import delegate from 'delegate';

// Специфичная для клиента логика загрузки...

const langFromMarkup = document.getElementsByTagName('html')[0].lang || 'en';
const initialState = window.__INITIAL_STATE__;

createApp({initialState, resources, language: langFromMarkup, renderSide: 'BROWSER'})
    .then(({app, router, store}) => {
        // to process internal link to navigate with vue router
        delegate('a[jb-route]', 'click', e => {
            e.preventDefault();
            router.push(e.delegateTarget.attributes.href.value);
        });
        return {app, router, store};
    })
    .then(null, err => console.error('Sorry, couldn\'t create app: ', err));

/**
 * See https://cookieconsent.insites.com
 */
(function cookieConsentInitializator() {
    if (!window) {
        return;
    }

    window.addEventListener("load", function () {
        window.cookieconsent.initialise({
            "palette": {
                "popup": {
                    "background": "#aa0000",
                    "text": "#ffdddd"
                },
                "button": {
                    "background": "#ff0000"
                }
            }
        })
    });
})();

(function (i, s, o, g, r, a, m) {
    i['GoogleAnalyticsObject'] = r;
    i[r] = i[r] || function () {
        (i[r].q = i[r].q || []).push(arguments)
    }, i[r].l = 1 * new Date();
    a = s.createElement(o),
        m = s.getElementsByTagName(o)[0];
    a.async = 1;
    a.src = g;
    m.parentNode.insertBefore(a, m)
})(window, document, 'script', 'https://www.google-analytics.com/analytics.js', 'ga');

(function initGoogleAnalytics() {
    ga('create', pubSettings.GoogleAnalyticsApiKey, 'auto');
})();