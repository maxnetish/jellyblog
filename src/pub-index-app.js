import pubSettings from '../config/pub-settings.json';

/**
 * public main script
 */
(function bootstrapApp() {

})();

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

(function initGoogleAnalytics(i, s, o, g, r, a, m) {
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

(function sendPageViewToGoogleAnalytics() {
    ga('create', pubSettings.GoogleAnalyticsApiKey, 'auto');
    ga('send', 'pageview');
})();