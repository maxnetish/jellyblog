/**
 * Module dependencies.
 */

var express = require('express'),
    path = require('path'),
    favicon = require('static-favicon'),
    logger = require('morgan'),
    cookieParser = require('cookie-parser'),
    bodyParser = require('body-parser'),
    routes = require('./routes/index'),
    session = require('express-session'),
    RedisStore = require('connect-redis')(session),
    debug = require('debug')('my-application'),
    http = require('http'),
    app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');


app.use(favicon());
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(cookieParser('2ed08f2517984233b6226bd377665a1f'));
app.use(session({
    store: new RedisStore({
        prefix: 'sess'
    })
}));
app.use(require('less-middleware')(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public')));

var checkAdminRights = function (req, res, next) {
    if (req.currentUser) {
        next();
    } else {
        res.statusCode = 401;
        res.end();
    }
};

app.use('/', routes);

/// catch 404 and forwarding to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

/// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function (err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

var server = app.listen(app.get('port'), function () {
     debug('Express server listening on port ' + app.get('port'));
});

// development only
// if ('development' == app.get('env')) {
//     app.use(express.errorHandler());
// }


/*
 app.get('/', loadUser, routes.index);

 app.get('/login', routes.login);
 app.post('/login', routes.login);
 app.get('/logout', routes.logout);
 app.get('/admin', loadUser, checkAdminRights, routes.admin);

 app.get('/api/userlist', loadUser, checkAdminRights, routes.apiUserList);
 app.post('/api/user', loadUser, checkAdminRights, routes.apiUserUpdate);
 //app.get('/users', user.list);

 http.createServer(app).listen(app.get('port'), function () {
 console.log('Express server listening on port ' + app.get('port'));
 });
 */