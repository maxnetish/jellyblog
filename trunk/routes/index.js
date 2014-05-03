var express = require('express');
var router = express.Router();
var model = require('../models').model;
var loginRoutes = require('./login');
var adminRoutes = require('./admin');
var navlinks = require('../models/navlinks');

var loadUser = function (req, res, next) {
    var User = model.User;
    if (req.session && req.session.userId) {
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

var checkAdminRights = function (req, res, next) {
    if (req.currentUser) {
        next();
    } else {
        res.statusCode = 401;
        res.end();
    }
};

/* GET home page. */
router.route('/').get(loadUser, function (req, res) {
    res.render('index', {
        title: 'Express',
        userId: req.currentUser && req.currentUser._id.toHexString(),
        userName: req.currentUser && req.currentUser.fullName && req.currentUser.login,
        navlinks: navlinks.createLinks({
            currentUrl: req.url,
            auth: !!req.currentUser
        })
    });
});

// login page
router.route('/login')
    .get(loginRoutes.login)
    .post(loginRoutes.login);

// logout
router.route('/logout').get(loginRoutes.logout);

// admin page
router.route('/admin').get(loadUser, adminRoutes.admin);

// admin api
router.route('/api/users')
    .get(loadUser, checkAdminRights, adminRoutes.apiUserlist)
    .post(loadUser, checkAdminRights, adminRoutes.apiUserUpdate)
    .delete(loadUser, checkAdminRights, adminRoutes.apiUserDelete);


module.exports = router;