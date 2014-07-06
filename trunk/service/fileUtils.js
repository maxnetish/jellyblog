/**
 * Created by Gordeev on 29.06.2014.
 */
var fs = require('fs-extra');
var path = require('path');
var Q = require('q');
var UPLOAD = 'upload';
var _ = require('underscore');

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

var removeFilePromise = function (relativePath) {
    var pathToRemove = path.join(__dirname, '..', 'public', relativePath),
        dfr = Q.defer();

    fs.unlink(pathToRemove, function (err) {
        if (err) {
            dfr.reject(err);
        } else {
            dfr.resolve(relativePath);
        }
    });

    return dfr.promise;
};

var saveTempFile = function (file, relativePath, callback) {
    relativePath = relativePath || UPLOAD;
    var pathToSave = path.join(__dirname, '..', 'public', relativePath, file.name);
    var deferred = Q.defer();


    fs.move(file.path, pathToSave, function (err) {
        if (callback) {
            callback(err, path.join(relativePath, file.name));
        }
        if (err) {
            deferred.reject(err);
        } else {
            fs.stat(pathToSave, function (err, fileStat) {
                if (err) {
                    deferred.reject(err);
                } else {
                    fileStat.name = file.name;
                    fileStat.url = path.join(relativePath, file.name);
                    deferred.resolve(fileStat);
                }
            });
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

var readFileStatPromise = function (dir, files) {
    var promises = [];
    _.each(files, function (oneFileName) {
        var dfr = Q.defer();
        fs.stat(path.join(dir, oneFileName), function (err, fileStat) {
            if (err) {
                dfr.reject(err);
            } else {
                fileStat.name = oneFileName;
                dfr.resolve(fileStat);
            }
        });
        promises.push(dfr.promise);
    });
    return Q.all(promises);
};

var readDirPromise = function (relativePath) {
    var target,
        deferred = Q.defer();

    relativePath = relativePath || UPLOAD;
    target = path.join(__dirname, '..', 'public', relativePath);

    fs.readdir(target, function (err, files) {
        if (err) {
            deferred.reject(err);
        } else {
            readFileStatPromise(target, files)
                .then(function (result) {
                    _.each(result, function (fileStat) {
                        fileStat.url = path.join(relativePath, fileStat.name);
                    });
                    deferred.resolve(result);
                })
                .then(null, function (err) {
                    deferred.reject(err);
                });
        }
    });

    return deferred.promise;
};

module.exports = {
    removeFilePromise: removeFilePromise,
    removeTempFiles: removeTempFiles,
    saveTempFile: saveTempFile,
    saveTempFilesPromise: saveTempFilesPromise,
    readDirPromise: readDirPromise
};