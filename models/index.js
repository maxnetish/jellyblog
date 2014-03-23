/**
 * Created by Gordeev on 23.03.14.
 */
var mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/jellyblog');

exports.model={
    User: require('./model.user').createUserModel(mongoose)
};