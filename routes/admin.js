/**
 * Created by Gordeev on 01.05.2014.
 */

var model = require('../models').model,
    _ = require('underscore');

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

var userUpdate=function(req, res){

};

var apiUserUpdate = function (req, res) {
    var userParams = req.body,
        User = model.User;

    if (userParams.id) {
        User.findByIdAndUpdate(userParams.id, {
            login: userParams.username,
            fullName: userParams.fullname
        }, function (error, result) {
            var toSend = {};
            if (error) {
                toSend.error = "Internal server error";
            } else {
                toSend.data = {
                    username: result.login,
                    fullname: result.fullName,
                    id: result._id.toHexString()
                }
            }
            res.json(toSend);
        });
    } else {
        User.create({
            login: userParams.username,
            fullName: userParams.fullname
        }, function(error, result){
           if(!error){
               result.setPassword(userParams.password);
               result.save(function(error, saveResult, affected){
                   if(!error){
                       res.json({
                           data:{
                               username: saveResult.login,
                               fullname: saveResult.fullName,
                               id: saveResult._id.toHexString()
                           }
                       });
                   }else{
                       res.json({
                           error: "Internal server error"
                       });
                   }
               });
           }else{
               res.json({
                   error: "Internal server error"
               });
           }
        });
    }
};

exports.admin = adminGet;
exports.apiUserlist = apiGetUserList;
exports.apiUserUpdate = apiUserUpdate;

