/**
 * Created by Gordeev on 14.08.2014.
 */
var express = require('express'),
    app = express(),
    dev = app.get('env') === 'development',

    response = function (err, req, res) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: dev ? err : {}
        });
    };

module.exports = response;