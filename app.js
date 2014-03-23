/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var user = require('./routes/user');
var http = require('http');
var path = require('path');
var RedisStore = require('connect-redis')(express);
var model = require('./models').model;

var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(express.cookieParser('2ed08f2517984233b6226bd377665a1f'));
app.use(express.session({
    store: new RedisStore({
        prefix: 'sess'
    })
}));
app.use(app.router);
app.use(require('less-middleware')(path.join(__dirname, '/public')));
app.use(express.static(path.join(__dirname, 'public')));

var loadUser = function (req, res, next) {
    var User = model.User;
    if (req.session.userId) {
        User.findById(req.session.userId, function (error, user) {
            if (user) {
                req.currentUser = user;
            }
            next();
        });
    } else {
        next();
    }
};

// development only
if ('development' == app.get('env')) {
    app.use(express.errorHandler());
}

app.get('/', loadUser, routes.index);

app.get('/login', routes.login);
app.post('/login', routes.login);
//app.get('/users', user.list);

http.createServer(app).listen(app.get('port'), function () {
    console.log('Express server listening on port ' + app.get('port'));
});
