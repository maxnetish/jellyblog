/**
 * Created by Gordeev on 23.03.14.
 */

var model = require('../models').model;

var loginGet = function (req, res) {
    res.render('login', { title: 'Login to jelly blog' });
};

var loginPost = function (req, res) {
    var User;
    if(req.body && req.body.username && req.body.password){
        User=model.User;
        User.findOne({login: req.body.username}, function(error, result){
            if(error){
                loginGet(req, res);
                return;
            }
            if(result && result.checkPassword(req.body.password)){
                req.session.userId=result._id.toHexString();
                res.redirect('/');
                return;
            }else{
                loginGet(req, res);
                return;
            }
        });
        return;
    }else{
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