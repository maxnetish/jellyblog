import isString from 'lodash/isString';

function createFilter() {
    return function getIsoString(dateOrString = new Date()) {
        const dt = isString(dateOrString) ? new Date(dateOrString) : dateOrString;
        return dt.toISOString();
    };
}

function install(Vue) {
    Vue.filter('date-to-iso-string', createFilter());
}

export default {
    createFilter,
    install
};