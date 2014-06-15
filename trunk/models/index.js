/**
 * Created by Gordeev on 12.06.2014.
 */
var mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/jellyblogdb');

exports.model={
    User: require('./user').createUserModel(mongoose),
    Post: require('./post').createPostModel(mongoose)
};