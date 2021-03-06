/**
 * Init polyfills
 */
// Need for dynamic imports
import 'core-js/modules/es6.promise';
import 'core-js/es6/array';
import 'core-js/es6/object';
import 'core-js/es6/symbol';

import {createApp} from './app';
import {resourcesFactory} from 'jb-resources';
import pubSettings from '../../../config/pub-settings.json';
import delegate from 'delegate';
import {atob} from 'b2a';

// Специфичная для клиента логика загрузки...

const resources = resourcesFactory();
const langFromMarkup = document.getElementsByTagName('html')[0].lang || 'en';
const initialState = deserializeJs(window.__INITIAL_STATE__);
// const initialState = window.__INITIAL_STATE__;

createApp({initialState, resources, language: langFromMarkup, renderSide: 'BROWSER'})
    .then(({app, router, store}) => {
        // to process internal link to navigate with vue router
        delegate('a[jb-route]', 'click', e => {
            e.preventDefault();
            router.push(e.delegateTarget.attributes.href.value);
        });
        registerRootEventsInBrowser({app});

        router.onReady(() => {
            app.$mount('#vue-app');
        });

        return {app, router, store};
    })
    .then(null, err => console.error('Sorry, couldn\'t create app: ', err));

function deserializeJs(serialized) {
    const decoded = atob(serialized);
    return eval(`(${decoded})`);
}

function registerRootEventsInBrowser({app}) {
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