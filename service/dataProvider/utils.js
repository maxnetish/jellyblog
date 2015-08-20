var _ = require('lodash'),
    Q = require('q');

function sanitizeDate(row) {
    var result;

    if (row) {
        if (_.isDate(row)) {
            result = row;
        } else if (_.isString(row)) {
            result = new Date(row);
        } else if (_.isNumber(row)) {
            result = new Date(row);
        }
    }

    return result;
}

function sanitizeBoolean(row) {
    var result = false;

    if (_.isNull(row) || _.isUndefined(row)) {
        return null;
    }

    if (row === 'on' || row === 'true') {
        result = true;
    } else if (row) {
        try {
            result = !!parseInt(row, 10);
        } catch (ignore) {
        }
    }
    return result;
}

module.exports = {
    sanitizeDate: sanitizeDate,
    sanitizeBoolean: sanitizeBoolean
};