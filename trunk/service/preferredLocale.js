/**
 * Created by Gordeev on 12.08.2014.
 */

var langHeader = 'accept-language',
    defaultLocale = 'en',
    detect = function (req) {
        var result = defaultLocale,
            commaPos;
        if (req.headers[langHeader] && req.headers[langHeader].length) {
            commaPos = req.headers[langHeader].indexOf(',');
            if (commaPos > 0) {
                result = req.headers[langHeader].substring(0, commaPos);
            }
        }
        return result;
    };

module.exports = {
    detect: detect
};
