const lang = document.getElementsByTagName('html')[0].lang || 'en';
const numberToLocaleStringSupportsLocale = (function () {
    var number = 0;
    try {
        number.toLocaleString('i');
    } catch (e) {
        return e.name === 'RangeError';
    }
    return false;
})();

function normalizeNum(num) {
    if (typeof num === 'number') {
        return num;
    }
    if (typeof num === 'string') {
        return parseInt(num, 10);
    }
    return NaN;
}


function numberToLocaleString(num, nanResult) {
    nanResult = typeof nanResult === 'undefined' ? null : nanResult;
    num = normalizeNum(num);
    if (isNaN(num)) {
        return nanResult;
    }
    if (!numberToLocaleStringSupportsLocale) {
        return num.toLocaleString();
    }
    return num.toLocaleString(lang);
}

export default numberToLocaleString;