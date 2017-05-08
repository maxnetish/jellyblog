import * as PostStatusFilter from './display-post-status';
import * as DateWithTimeFilter from './display-date-time';
import * as DateWithoutTimeFilter from './display-date';

const filterComponents = [
    PostStatusFilter,
    DateWithTimeFilter,
    DateWithoutTimeFilter
];

const filterFuncs = {};

filterComponents.forEach(function(component){
    filterFuncs[component.name] = component.func;
});

function filter(filterName) {
    return filterFuncs[filterName];
}

function setLocale(locale = 'en') {
    filterComponents.forEach(function(component){
        if(component.setLocale) {
            component.setLocale(locale);
        }
    });
}

export {
    filter,
    setLocale
};