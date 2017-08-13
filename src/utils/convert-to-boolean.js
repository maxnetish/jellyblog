import isBoolean from 'lodash/isBoolean';
import isString from 'lodash/isString';

const falseString = [
    'false',
    'off',
    '0',
    ''
];

function toBoolean(val) {
    if(isBoolean(val)) {
        return val;
    }
    if(isString(val) && falseString.indexOf(val) > -1) {
        return false;
    }
    return !!val;
}

export default toBoolean;