/*
 * GET home page.
 */

exports.index = function (req, res) {
    res.render('index', { title: 'Express', userId: req.currentUser && req.currentUser._id.toHexString() });
};

exports.login = require('./login').login;