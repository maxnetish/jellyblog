// import * as i18n from '../../i18n';

function getLocaleText(key) {
    const locale = this.$store.state.langApp;
    if (locale.hasOwnProperty(key)) {
        return locale[key];
    }
    return key;
}

function install(Vue) {
    // Vue.filter('get-text', createFilter());
    Vue.mixin({
        methods: {
            getText: getLocaleText
        }
    })
}

export default {
    install
};