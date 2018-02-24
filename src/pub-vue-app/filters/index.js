import {createDatetimeToIsoFilter} from './date-to-iso-string';
import {createLocaleDatetimeFilter} from './date-to-locale-string';
import {createGetTextFilter} from './get-text';


function registerAsync(VueCtor, {language}) {
    const filtersToRegister = [
        {
            name: 'get-text',
            factory: createGetTextFilter(language)
        },
        {
            name: 'locale-datetime',
            factory: createLocaleDatetimeFilter(language)
        },
        {
            name: 'date-to-iso-string',
            factory: createDatetimeToIsoFilter()
        }
    ];

    return Promise.all(filtersToRegister.map(item => Promise.resolve(item.factory)))
        .then(filters => {
            filters.forEach((filter, index) => VueCtor.filter(filtersToRegister[index].name, filter));
        });
}

export {
    registerAsync
};