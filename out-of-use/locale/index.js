/**
 * Created by mgordeev on 11.06.2014.
 */
var _ = require('underscore'),
    lang = {
        en: require('./en.json'),
        ru: require('./ru.json')
    },
    defaultLocale = 'en',
    getText = function (key, locale) {
        var primaryDictionary, fallbackDictionary,
            primaryProp, locale = locale || defaultLocale,
            result = key;

        if (!key) {
            return result;
        }

        for (prop in lang) {
            if (locale.substring(0, prop.length) == prop) {
                primaryProp = prop;
                primaryDictionary = lang[prop];
                break;
            }
        }
        if (primaryProp !== defaultLocale) {
            fallbackDictionary = lang[defaultLocale];
        }
        if (primaryDictionary && primaryDictionary.hasOwnProperty(key)) {
            result = primaryDictionary[key];
        } else if (fallbackDictionary && fallbackDictionary.hasOwnProperty(key)) {
            result = fallbackDictionary[key];
        }
        return result;
    };

module.exports = {
    en: lang.en,
    ru: lang.ru,
    lang: lang,
    getText: getText
};