/**
 * Created by Gordeev on 03.08.2014.
 */
define('data.utils',
    [
        '_',
        'ko',
        'logger'
    ],
    function (_, ko, logger) {
        var clearEmptyStrings = function (model) {
                var thisContext = model || this,
                    prop;
                _.forOwn(thisContext, function (val, prop) {
                    if (_.isString(val) && val.length === 0) {
                        val = undefined;
                    }
                });
                return thisContext;
            },
            toPlain = function (model) {
                var thisContext = model || this,
                    result = {};
                _.forOwn(thisContext, function (val, key) {
                    if (ko.isObservable(val)) {
                        result[key] = val();
                    } else if (!_.isFunction(val)) {
                        result[key] = val;
                    }
                });
                return result;
            },
            onDataFail = function (jqXHR, textStatus, errorThrown) {
                logger.log({
                    status: textStatus,
                    error: errorThrown
                });
            };

        return {
            clearEmptyStrings: clearEmptyStrings,
            toPlain: toPlain,
            onFail: onDataFail
        };
    });