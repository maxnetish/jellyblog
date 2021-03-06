import localeEn from './en.json';
import localeRu from './ru.json';
import {memoize} from 'lodash';

const texts = {
    en: localeEn,
    ru: localeRu
};

let defaultLocale = 'en';

function getOrSetLocale(newLocale) {
    if (!newLocale) {
        return defaultLocale;
    }

    if (texts.hasOwnProperty(newLocale)) {
        defaultLocale = newLocale;
    }

    return defaultLocale;
}

function getText(key = '', locale = defaultLocale) {
    if (!texts.hasOwnProperty(locale)) {
        return key;
    }

    if (!texts[locale].hasOwnProperty(key)) {
        return key;
    }

    return texts[locale][key];
}

const getTextByLanguage = memoize(language => key => getText(key, language), (key, language) => language);

export {
    getOrSetLocale as locale,
    getText,
    getTextByLanguage
};