/**
 * Created by Gordeev on 03.05.2014.
 */
var allLinks = require('./navlinks-data.json');
var _ = require('underscore');

var createLinks = function (opts) {
    var result = [];

    opts = opts || {};
    opts.auth = opts.auth || false;
    opts.currentUrl = opts.currentUrl || '/';

    result = _.filter(allLinks, function (l) {
        var res = true;
        res = l.url !== opts.currentUrl;
        if (l.auth) {
            res = res && opts.auth;
        }
        if (l.noauth) {
            res = res && !opts.auth;
        }
        return res;
    });

    return result;
};

exports.createLinks = createLinks;