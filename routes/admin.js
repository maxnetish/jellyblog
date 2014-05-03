/**
 * Created by Gordeev on 01.05.2014.
 */

var model = require('../models').model,
    _ = require('underscore'),
    User = model.User,
    navlinks = require('../models/navlinks');

var adminGet = function (req, res) {
    var vm = {
        title: "Jellyblog administration",
        navlinks: navlinks.createLinks({
            auth: !!req.currentUser,
            currentUrl: req.url
        })
    };
    res.render("admin", vm);
};

var apiGetUserList = function (req, res) {
    var userList = [];
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

var checkSecret = function (req) {
    if (req.body.secret) {
        return req.body.secret.length > 5;
    } else {
        return true;
    }
};

var checkUserProps = function (req) {
    return req.body.username && (req.body.fullname ? req.body.fullname.length < 128 : true);
};

var userCreate = function (req, res) {
    if (!checkUserProps(req)) {
        res.json({
            error: "Bad username or/and fullname",
            data: req.body
        });
        return;
    }

    if (!req.body.secret || !checkSecret(req)) {
        res.json({
            error: "Bad password",
            data: req.body
        });
        return;
    }

    User.create({
        login: req.body.username,
        fullName: req.fullname
    }, function (error, result) {
        if (!error) {
            result.setPassword(req.body.secret);
            result.save(function (error, saveResult) {
                if (!error) {
                    res.json({
                        data: saveResult.toPlainObject()
                    });
                } else {
                    res.json({
                        error: "Internal error"
                    });
                }
            });
        } else {
            res.json({
                error: "Cannot create user.",
                data: req.body
            });
        }
    });
};

var userUpdate = function (req, res) {

    if (!checkUserProps(req)) {
        res.json({
            error: "Bad username or/and fullname",
            data: req.body
        });
        return;
    }

    if (!checkSecret(req)) {
        res.json({
            error: "Bad password",
            data: req.body
        });
        return;
    }

    User.findByIdAndUpdate(req.body.id, {
        login: req.body.username,
        fullName: req.body.fullname
    }, function (error, result) {
        if (!error) {
            if (req.body.secret) {
                result.setPassword(req.body.secret);
                result.save(function (error) {
                    if (!error) {
                        res.json({
                            data: result.toPlainObject()
                        });
                    } else {
                        res.json({
                            error: "Internal error",
                            data: result.toPlainObject()
                        });
                    }
                });
            } else {
                res.json({
                    data: result.toPlainObject()
                });
            }
        } else {
            res.json({
                error: "Cannot update user.",
                data: req.body
            });
        }
    });
};

var apiUserUpdate = function (req, res) {
    if (req.body && req.body.id) {
        userUpdate(req, res);
    } else {
        userCreate(req, res);
    }
};

var apiUserDelete = function (req, res) {
    if (!req.body.id) {
        res.statusCode = 400; // bad request
        res.end();
    }

    // always must be more than 0 users
    User.count({}, function (error, count) {
        if (!error) {
            if (count > 1) {
                User.findByIdAndRemove(req.body.id, function (error, result) {
                    if (!error) {
                        res.json({
                            data: result.toPlainObject()
                        });
                    } else {
                        res.json({
                            error: "Remove fails"
                        });
                    }
                });
            } else {
                res.json({
                    error: "You cannot remove last user",
                    data: req.body
                })
            }
        } else {
            res.json({
                error: "Internal server error",
                data: req.body
            })
        }
    });
};

exports.admin = adminGet;
exports.apiUserlist = apiGetUserList;
exports.apiUserUpdate = apiUserUpdate;
exports.apiUserDelete = apiUserDelete;

