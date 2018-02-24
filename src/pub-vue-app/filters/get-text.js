// import * as i18n from '../../i18n';

function createFilter(language = 'en') {

    return import(
        /* webpackChunkName: "lang-",
        webpackMode: "lazy" */
        `../../i18n/${language}.json`
        )
        .then(locale => {
            return function getLocaletext(key) {
                if (locale.hasOwnProperty(key)) {
                    return locale[key];
                }
                return key;
            };
        })
        .then(null, err => {
            return function getFallbackLocaleText(key){
                return key;
            };
        });
}

export {
    createFilter as createGetTextFilter
};