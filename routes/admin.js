/**
 * Created by Gordeev on 01.05.2014.
 */

var model = require('../models').model,
    _ = require('underscore');

var checkRights = function (req, res) {
    var result = false;
    if (req.currentUser) {
        result = true;
    } else {
        result = false;
        res.statusCode = 401;
        res.end();
    }
    return result;
};

var adminGet = function (req, res) {
    var vm = {};
    res.render("admin", vm);
};

var apiGetUserList = function (req, res) {
    var User = model.User,
        userList = [];
    User.find({}, function (error, result) {
        if (error) {
            res.json(500, {
                error: error,
                data: userList
            });
        } else {
            userList = _.map(result, function (oneResult) {
                return {
                    username: oneResult.login,
                    fullname: oneResult.fullName,
                    id: oneResult._id.toHexString()
                };
            });
            res.json({
                data: userList
            });
        }
    });
};

exports.admin = function (req, res) {
    if (checkRights(req, res)) {
        adminGet(req, res);
    }
};

exports.apiUserlist = function (req, res) {
    if (checkRights(req, res)) {
        apiGetUserList(req, res);
    }
};