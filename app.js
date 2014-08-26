var express = require('express');
var path = require('path');
var favicon = require('static-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var serviceAuth = require('./service/auth');
var preferredLocale = require('./service/preferredLocale');

// session support
var session = require('express-session');
var MongoStore = require('connect-mongo')(session);

/* ================= passport.js config: =============== */
var passport = require('passport');
serviceAuth.passportInit();
/* ================ passport config almost done ============== */

var routes = require('./routes/index');
var routesAuth = require('./routes/auth');
var routesAdmin = require('./routes/admin');
var routesApi = require('./routes/api');
var routesPost = require('./routes/post');

var app = express();

console.log('Express mode: ' + app.get('env'));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(favicon());
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(cookieParser());

// session setup
app.use(session({
    secret: 'eun2kc8KN9kxm',
    name: 'sid',
    store: new MongoStore({
        db: 'jellyblogdb'
    })
}));
// passport inject
app.use(passport.initialize());
app.use(passport.session());

// inject check rights
app.use(serviceAuth.hasAdminRights);

// inject locale detection
app.use(preferredLocale.detect);

// detect if client want json
app.use(function (req, res, next) {
    req.wantJson = req.headers['accept'] && req.headers['accept'].indexOf('application/json') > -1;
    next();
});

app.use(require('less-middleware')(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);
app.use('/auth', routesAuth);
app.use('/admin', routesAdmin);
app.use('/api', routesApi);
app.use('/post', routesPost);
// app.use('/users', users);

/// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

/// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use('/api', function (err, req, res, next) {
        var status = err.status || 500;
        res.status(status);
        res.send({
            status: status,
            message: err.message,
            error: err,
            stack: err.stack
        });
    });
    app.use(function (err, req, res, next) {
        var responseVm = {
                message: err.message,
                error: err
            };
        res.status(err.status || 500);

        if (req.wantJson) {
            res.json(responseVm);
        } else {
            res.render('error', responseVm);
        }
    });
}

// production error handler
// no stacktraces leaked to user
app.use('/api', function (err, req, res, next) {
    var status = err.status || 500;
    res.status(status);
    res.send({
        status: status,
        message: err.message,
        error: {}
    });
});
app.use(function (err, req, res, next) {
    var responseVm = {
        message: err.message,
        error: {}
    };
    res.status(err.status || 500);

    if(req.wantJson){
        res.json(responseVm);
    }else {
        res.render('error', responseVm);
    }
});

module.exports = app;
