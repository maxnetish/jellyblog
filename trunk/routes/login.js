/**
 * Created by Gordeev on 23.03.14.
 */

var express = require('express');
var router = express.Router();
var model = require('../models').model;

var loginGet = function (req, res, errorMessage) {
    res.render('login', { title: 'Login to jelly blog', errorMessage: errorMessage });
};

var loginPost = function (req, res) {
    var User;
    if (req.body && req.body.username && req.body.password) {
        User = model.User;
        User.findOne({login: req.body.username}, function (error, result) {
            if (error) {
                loginGet(req, res, "Internal server error");
                return;
            }
            if (result && result.checkPassword(req.body.password)) {
                req.session.userId = result._id.toHexString();
                res.redirect('/');
                return;
            } else {
                loginGet(req, res, "Authentication failed, access denied");
                return;
            }
        });
        return;
    } else {
        loginGet(req, res);
    }
};

exports.login = function (req, res) {
    if (req.method === "GET") {
        loginGet(req, res);
    } else if (req.method === "POST") {
        loginPost(req, res);
    }
};
exports.logout = function (req, res) {
    if (req.session) {
        req.session.userId = null;
    }
    loginGet(req, res);
};