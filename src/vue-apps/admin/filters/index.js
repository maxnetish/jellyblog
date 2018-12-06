import Vue from 'vue';

import getLocaleText from './get-text';
import contentTypeToIcon from './content-type-to-icon';
import numberToLocaleString from './number-to-locale';

Vue.filter('get-text', getLocaleText);
Vue.filter('content-type-to-icon', contentTypeToIcon);
Vue.filter('number-to-locale-string', numberToLocaleString);

export {
    getLocaleText as getText
};