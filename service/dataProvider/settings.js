var model = require('../models').model,
    _ = require('lodash'),
    Q = require('q'),
    utils = require('./utils');

function promiseSettings () {
    var query,
        dfr = Q.defer();

    query = model.Settings.find(null, null, {
        limit: 1
    });

    query.exec()
        .then(function (result) {
            if (result && result.length) {
                dfr.resolve(result[0]);
            } else {
                // have to create one
                model.Settings.create({})
                    .then(function (newSettings) {
                        dfr.resolve(newSettings);
                    })
                    .then(null, function (err) {
                        dfr.reject(err);
                    });
            }
        })
        .then(null, function (err) {
            dfr.reject(err);
        });

    return dfr.promise;
}

function promiseSettingsUpdate (settings) {
    var query,
        id = settings._id;

    delete settings._id;
    query = model.Settings.findByIdAndUpdate(id, settings, {new: true});

    return query.exec();
}

module.exports = {
    promiseSettings: promiseSettings,
    promiseSettingsUpdate: promiseSettingsUpdate
};
