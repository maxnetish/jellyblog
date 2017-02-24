const name = 'postStatus';

const statuses = {
    'en': {
        'DRAFT': 'Draft',
        'PUB': 'Published'
    },
    'ru': {
        'DRAFT': 'Черновик',
        'PUB': 'Опубликован'
    }
};

let defaultLocale = 'en';

function setLocale(localeCode = 'en') {
    defaultLocale = localeCode;
}

function func(status, locale = defaultLocale) {
    if (statuses[locale] && statuses[locale][status]) {
        return statuses[locale][status];
    }

    return status;
}
export {
    name,
    func,
    setLocale
};