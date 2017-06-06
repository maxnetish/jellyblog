import * as i18n from '../../i18n';

const lang = document.getElementsByTagName('html')[0].lang || 'en';
i18n.locale(lang);
function getLocaleText(key) {
    return i18n.getText(key);
}

export default getLocaleText;