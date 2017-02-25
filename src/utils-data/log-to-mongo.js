import {Log} from '../models';

function addEntryFromMorgan (tokens, req, res) {
    let row = {
        requestUrl: tokens.url(req),
        requestMethod: tokens.method(req),
        responseTime: tokens['response-time'](req, res),
        responseStatus: tokens.status(req, res),
        referrer: tokens.referrer(req),
        remoteAddress: tokens['remote-addr'](req),
        httpVersion: tokens['http-version'](req),
        userAgent: tokens['user-agent'](req),
        userName: tokens['user-name'](req, res),
        date: tokens['date'](req, res, 'iso')
    };
    Log.create(row);
}

function addEntryFromErrorResponse (req, res, err) {
    let row = {
        requestUrl: req.originalUrl || req.url,
        requestMethod: req.method,
        error: 'Message: ' + err.message + '; Stack: ' + err.stack,
        date: new Date()
    };
    Log.create(row);
}

export {
    addEntryFromMorgan,
    addEntryFromErrorResponse
};