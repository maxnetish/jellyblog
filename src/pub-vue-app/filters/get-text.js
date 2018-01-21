import * as i18n from '../../i18n';

function createFilter(language = 'en') {
    return function getLocaleText(key) {
       return i18n.getText(key, language);
    };
}

export {
    createFilter as createGetTextFilter
};