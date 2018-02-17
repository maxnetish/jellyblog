import isString from 'lodash/isString';

function createFilter() {
    return function getIsoString(dateOrString = new Date()) {
        var dt = isString(dateOrString) ? new Date(dateOrString) : dateOrString;
        return dt.toISOString();
    };
}

export {
    createFilter as createDatetimeToIsoFilter
};