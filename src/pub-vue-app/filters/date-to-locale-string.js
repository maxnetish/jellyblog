import dateFnsFormat from 'date-fns/format';
import enLocale from 'date-fns/locale/en';
import ruLocale from 'date-fns/locale/ru';

// There is no elegant way pass fns locale throw state
// like we do with {locale}.json
// because fns locale is functions

function getLocaleDatetime(date = new Date(), format = 'MMMM D YYYY') {
    const appLocale = this.$store.state.langApp;
    const language = this.$store.state.language;
    const dateFnsLocale = language === 'ru' ? ruLocale : enLocale;
    // const dateFnsLocale = this.$store.state.langDateFns;
    // var dateFnsLocale;
    const actualFormat = appLocale[format] || format;
    const result = dateFnsFormat(date, actualFormat, {locale: dateFnsLocale});
    return result;
}

function install(Vue) {
    Vue.mixin({
        methods: {
            localeDatetime: getLocaleDatetime
        }
    })
}

export default {
    install
};