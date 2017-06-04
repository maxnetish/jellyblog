import Vue from 'vue';
import * as i18n from '../../i18n';

const lang = document.getElementsByTagName('html')[0].lang || 'en';

i18n.locale(lang);

function getLocaleText(key) {
    return i18n.getText(key);
}

Vue.filter('get-text',getLocaleText);

export {
    getLocaleText as getText
};