import Vue from 'vue';
import * as i18n from '../../i18n';

const lang = document.getElementsByTagName('html')[0].lang || 'en';

i18n.locale(lang);

Vue.filter('get-text', function getLocaleText(key) {
    return i18n.getText(key);
});