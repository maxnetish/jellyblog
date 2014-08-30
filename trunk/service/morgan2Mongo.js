/**
 * Created by Gordeev on 30.08.2014.
 */

var model = require('../models').model;

var addEntryFromMorgan = function (tokens, req, res) {
    var row = {
        requestUrl: tokens.url(req),
        requestMethod: tokens.method(req),
        responseTime: Date.now() - req._startTime,
        responseStatus: tokens.status(req, res),
        referrer: tokens.referrer(req),
        remoteAddress: tokens['remote-addr'](req),
        httpVersion: tokens['http-version'](req),
        userAgent: tokens['user-agent'](req),
        userName: req.user ? req.user.displayName : null,
        date: new Date()
    };
    model.Log.create(row);
};

var addEntryFromErrorResponse = function (req, res, err) {
    var row = {
        requestUrl: req.originalUrl || req.url,
        requestMethod: req.method,
        error: 'Message: ' + err.message + '; Stack: ' + err.stack,
        date: new Date()
    };
    model.Log.create(row);
};

module.exports = {
    addEntryFromMorgan: addEntryFromMorgan,
    addEntryFromErrorResponse: addEntryFromErrorResponse
};