import {Log} from '../models';


/**
 * tokens is morgan
 * @param tokens
 * @param req
 * @param res
 */
function addEntryFromMorgan (tokens, req, res) {
    const row = {
        requestUrl: tokens.url(req),
        requestMethod: tokens.method(req),
        responseTime: tokens['response-time'](req, res),
        responseStatus: tokens.status(req, res),
        referrer: tokens.referrer(req),
        remoteAddress: tokens['realRemoteAddress'](req),
        httpVersion: tokens['http-version'](req),
        userAgent: tokens['user-agent'](req),
        userName: tokens['user-name'](req, res),
        date: tokens['date'](req, res, 'iso')
    };
    Log.create(row);
}

function addEntryFromErrorResponse (req, res, err) {
    const row = {
        requestUrl: req.originalUrl || req.url,
        requestMethod: req.method,
        error: 'Message: ' + err.message + '; Stack: ' + err.stack,
        date: new Date()
    };
    return Log.create(row);
}

export {
    addEntryFromMorgan,
    addEntryFromErrorResponse
};
