/**
 * Created by Gordeev on 29.06.2014.
 */
var fs = require('fs');
var path = require('path');
var Q = require('q');

var removeTempFiles = function (files) {
    var key;

    files = files || {};

    for (key in files) {
        if (files.hasOwnProperty(key)) {
            if (files[key].path) {
                fs.unlink(files[key].path, function (err) {
                    if (err) {
                        console.log(err);
                    }
                });
            }
        }
    }
};

var saveTempFile = function (file, relativePath, callback) {
    relativePath = relativePath || 'upload';
    var pathToSave = path.join(__dirname, '..', 'public', relativePath, file.name);
    var deferred = Q.defer();


    fs.rename(file.path, pathToSave, function (err) {
        if (callback) {
            callback(err, path.join(relativePath, file.name));
        }
        if (err) {
            deferred.reject(err);
        } else {
            deferred.resolve(path.join(relativePath, file.name));
        }
    });

    return deferred.promise;
};

var saveTempFilesPromise = function (files, relativePath) {
    var key, promises = [];

    for (key in files) {
        if (files.hasOwnProperty(key) && files[key].path && files[key].path.length) {
            promises.push(saveTempFile(files[key], relativePath));
        }
    }

    return Q.all(promises);
};

module.exports = {
    removeTempFiles: removeTempFiles,
    saveTempFile: saveTempFile,
    saveTempFilesPromise: saveTempFilesPromise
};