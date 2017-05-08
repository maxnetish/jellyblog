/**
 * Created by Gordeev on 12.06.2014.
 */
var mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/jellyblogdb');

exports.model = {
    User: require('./user').createUserModel(mongoose),
    Post: require('./post').createPostModel(mongoose),
    Navlink: require('./navlink').createNavlinkModel(mongoose),
    Settings: require('./misc-settings').createSettingsModel(mongoose),
    Log: require('./log-record').createLogRecordModel(mongoose),
    FileStoreMeta: require('./file-store').createFileStoreModel(mongoose)
};