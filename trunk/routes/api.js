/**
 * Created by mgordeev on 02.06.2014.
 */

var express = require('express');
var router = express.Router();
var locales = require('../locale');
var dataProvider = require('../service/dataProvider');
var multipartMiddleware = require('connect-multiparty')();
var fileUtils = require('../service/fileUtils');
var Q = require('q');

var createError = function (status, message) {
    var result = new Error(message);
    result.status = status;
    return result;
};
var createError401 = function () {
    return createError(401, 'Only admin can');
};
var createError400 = function (invalidParametrName) {
    var result = createError(400, 'Invalid param: ' + invalidParametrName);
    result.invalidParameter = invalidParametrName;
    return result;
};

router.delete('/post', function (req, res, next) {
    var id = req.body.id,
        promise;

    if (!id) {
        next(createError400('id'));
        return;
    }

    if (!req.userHasAdminRights) {
        next(createError401());
        return;
    }

    promise = dataProvider.promisePostRemove(id);

    promise
        .then(function (result) {
            return res.send(result);
        })
        .then(null, next);
});

router.post('/post', function (req, res, next) {
    var formData = req.body,
        id = formData._id,
        promise;

    if (!req.userHasAdminRights) {
        next(createError401());
        return;
    }

    if (id) {
        promise = dataProvider.promisePostUpdate(formData);
    } else {
        promise = dataProvider.promisePostCreate(formData);
    }

    promise
        .then(function (result) {
            return res.send(result);
        })
        .then(null, next);
});

router.post('/post/draft', function (req, res, next) {
    var formData = req.body,
        promise;

    if (!req.userHasAdminRights) {
        next(createError401());
        return;
    }

    promise = dataProvider.promisePostDraftUpdate(formData);
    promise.then(function (result) {
        return res.send(result);
    }).then(null, next);
});

router.post('/post/featured', function (req, res, next) {
    var formData = req.body,
        promise;

    if (!req.userHasAdminRights) {
        next(createError401());
        return;
    }

    promise = dataProvider.promisePostFeaturedUpdate(formData);
    promise.then(function (result) {
        return res.send(result);
    }).then(null, next);
});

router.get('/post', function (req, res, next) {
    var id = req.query.id,
        slug = req.query.slug,
        promise;

    if (id) {
        promise = dataProvider.promisePostGetById(id);
    } else if (slug) {
        promise = dataProvider.promisePostGetBySlug(slug);
    } else {
        next(createError(400, 'id or slug required'));
        return;
    }

    promise
        .then(function (result) {
            if (!result) {
                next(createError(404, 'No such post'));
                return;
            }
            if (result.draft && !req.userHasAdminRights) {
                next(createError401());
                return;
            }
            res.send(result);
        })
        .then(null, next);
});

router.get('/posts', function (req, res, next) {
    if (req.query.includeDraft && !req.userHasAdminRights) {
        next(createError401()); // unauthorized
        return;
    }

    dataProvider.promisePostsList(req.query)
        .then(function (result) {
            res.send(result);
        })
        .then(null, next);
});

router.get('/navlinks', function (req, res, next) {
    var query = req.query;
    dataProvider.promiseNavlinkList(query.category)
        .then(function (result) {
            return res.send(result);
        })
        .then(null, next);
});

router.post('/navlink', function (req, res, next) {
    var formData = req.body,
        id = formData._id,
        promise;

    if (!req.userHasAdminRights) {
        next(createError401());
        return;
    }

    if (id) {
        promise = dataProvider.promiseNavlinkUpdate(formData);
    } else {
        promise = dataProvider.promiseNavlinkCreate(formData);
    }

    promise
        .then(function (result) {
            return res.send(result);
        })
        .then(null, next);
});

router.delete('/navlink', function (req, res, next) {
    var id = req.query.id,
        promise;

    if (!id) {
        next(createError400('id'));
        return;
    }

    if (!req.userHasAdminRights) {
        next(createError401());
        return;
    }

    promise = dataProvider.promiseNavlinkRemove(id);

    promise
        .then(function (result) {
            return res.send(result);
        })
        .then(null, next);
});

router.get('/locale', function (req, res) {
    var langCode = req.query.lang || 'en',
        localeTable = locales[langCode] || locales[langCode.slice(0, 2)] || locales.en;

    res.send(localeTable);
});

router.post('/upload', multipartMiddleware, function (req, res, next) {
    if (!req.userHasAdminRights) {
        fileUtils.removeTempFiles(req.files);
        next(createError401());
        return;
    }

    fileUtils.saveTempFilesPromise(req.files, 'upload')
        .then(function (result) {
            return res.send(result);
        })
        .then(null, next);
});

router.get('/upload', function (req, res, next) {
    if (!req.userHasAdminRights) {
        next(createError401());
        return;
    }

    fileUtils.readDirPromise('upload')
        .then(function (files) {
            return res.send(files);
        })
        .then(null, next);
});

router.delete('/upload', function (req, res, next) {
    var relativePath = req.query.path

    if (!req.userHasAdminRights) {
        next(createError401());
        return;
    }

    fileUtils.removeFilePromise(relativePath)
        .then(function (result) {
            res.send(result);
        })
        .then(null, next);
});

router.get('/settings', function (req, res, next) {
    dataProvider.promiseSettings()
        .then(function (result) {
            return res.send(result);
        })
        .then(null, next);
});

router.post('/settings', function (req, res, next) {
    var settings = req.body;

    if (!req.userHasAdminRights) {
        next(createError401());
        return;
    }

    dataProvider.promiseSettingsUpdate(settings)
        .then(function (result) {
            return res.send(result);
        })
        .then(null, next);
});

module.exports = router;