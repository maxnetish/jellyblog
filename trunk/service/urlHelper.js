/**
 * Created by mgordeev on 15.08.2014.
 */

var URL = require('url'),
    _ = require('underscore'),
    configUrl = require('../config').url;

var rootUrl = configUrl.root;
var hostUrl = configUrl.host;

var getParsedUrl = function (urlOrString) {
    if (_.isString(urlOrString)) {
        return URL.parse(urlOrString, true);
    }
    return urlOrString;
};

var removeLastPart = function (url) {
    var parsed = getParsedUrl(url),
        pathnameParts = parsed.pathname.split('/') || [],
        leading = parsed.pathname[0] === '/' ? '/' : '',
        result;

    pathnameParts.pop();
    parsed.pathname = pathnameParts.join('/');
    if (leading && parsed.pathname.substring(0, 1) !== leading) {
        parsed.pathname = leading + parsed.pathname;
    }
    result = URL.format(parsed);
    return result;
};

var removeQueryParam = function (url, paramName) {
    var parsed = getParsedUrl(url),
        result;
    if (paramName) {
        delete parsed.query[paramName];
        delete parsed.search;
    }
    result = URL.format(parsed);
    return result;
};

/**
 * combine path and query
 * @param one
 * @param another
 */
var combine = function (one, another) {
    var oneParsed = getParsedUrl(one),
        anotherParsed = getParsedUrl(another),
        combinedPathname,
        result;

    combinedPathname = oneParsed.pathname;
    if (oneParsed.pathname.substring(oneParsed.pathname.length - 1) !== '/' && anotherParsed.pathname.substring(0, 1) !== '/') {
        combinedPathname = combinedPathname + '/';
    }
    if (oneParsed.pathname.substring(oneParsed.pathname.length - 1) === '/' && anotherParsed.pathname.substring(0, 1) === '/') {
        combinedPathname = combinedPathname.substring(0, combinedPathname.length - 1);
    }
    combinedPathname = combinedPathname + anotherParsed.pathname;
    if (combinedPathname.substring(combinedPathname.length - 1) === '/') {
        combinedPathname = combinedPathname.substring(0, combinedPathname.length - 1);
    }

    oneParsed.pathname = combinedPathname;
    oneParsed.query = _.extend(oneParsed.query, anotherParsed.query);
    delete oneParsed.search;

    result = URL.format(oneParsed);
    return result;
};

var addIfEmptyPath = function(url, addPart){
    var parsed = getParsedUrl(url);
    if(parsed.pathname === '/' || parsed.pathname.length ===0){
        parsed.pathname = parsed.pathname + addPart;
    }
    return URL.format(parsed);
};


module.exports = {
    removeLastPart: removeLastPart,
    removeQueryParam: removeQueryParam,
    combine: combine,
    addIfEmptyPath: addIfEmptyPath,
    rootUrl: rootUrl,
    hostUrl: hostUrl
};