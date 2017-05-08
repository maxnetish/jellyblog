const name = 'dateWithoutTime';

const localeStringSupportsLocales = (function toLocaleStringSupportsLocales() {
    try {
        new Date().toLocaleDateString('i');
    } catch (e) {
        return e instanceof RangeError;
    }
    return false;
})();

let defaultLocale = 'en';

function setLocale(localeCode) {
    defaultLocale = localeCode;
}

function func(dateSerializedAsJson, locale = defaultLocale) {
    if (!dateSerializedAsJson) {
        return dateSerializedAsJson;
    }
    let dateParsed;
    let result;
    try {
        dateParsed = new Date(dateSerializedAsJson);
    }
    catch (err) {
        console.warn(`Can not parse string [${dateSerializedAsJson}] as Date`);
        result = 'No date'
    }

    result = result || (localeStringSupportsLocales ? dateParsed.toLocaleDateString(locale) : dateParsed.toLocaleDateString());
    return result;
}
export {
    name,
    func,
    setLocale
};