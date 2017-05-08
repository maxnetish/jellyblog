/**
 * locale detection middleware
 */
var langHeader = 'accept-language',
    defaultLocale = 'en',
    detect = function (req, res, next) {
        var result = defaultLocale,
            commaPos;
        if (req.headers[langHeader] && req.headers[langHeader].length) {
            commaPos = req.headers[langHeader].indexOf(',');
            if (commaPos > 0) {
                result = req.headers[langHeader].substring(0, commaPos);
            }
        }
        req.preferredLocale = result;
        next();
    };

module.exports = {
    detect: detect
};
