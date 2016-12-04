/**
 * Created by mgordeev on 03.09.2014.
 */

var MobileDetect = require('mobile-detect');

var detect = function (req, res, next) {
    var userAgentString = req.headers['user-agent'],
        detectionInstance = new MobileDetect(userAgentString);
        req.detectUserAgent = detectionInstance;
    next();
};

module.exports = {
    detect: detect
};