/**
 * Created by mgordeev on 02.06.2014.
 */

var express = require('express');
var router = express.Router();
//var locales = require('../locale');
var dataProvider = require('../service/dataProvider');
//var multipartMiddleware = require('connect-multiparty')();
//var fileUtils = require('../service/fileUtils');
//var importPosts = require('../service/importPostsFromJson');
//var Q = require('q');
//var indexVm = require('../service/vm/indexVm');
//var postVm = require('../service/vm/postVm');
//var urlHelper = require('../service/urlHelper');

//var createError = function (status, message) {
//    var result = new Error(message);
//    result.status = status;
//    return result;
//};
//var createError401 = function () {
//    return createError(401, 'Only admin can');
//};
//var createError400 = function (invalidParametrName) {
//    var result = createError(400, 'Invalid param: ' + invalidParametrName);
//    result.invalidParameter = invalidParametrName;
//    return result;
//};
//

router.get('/', function(req, res){
   res.json({
       apirequest: 'success'
   });
});

//router.delete('/post', function (req, res, next) {
//    var id = req.body.id,
//        promise;
//
//    if (!id) {
//        next(createError400('id'));
//        return;
//    }
//
//    if (!req.userHasAdminRights) {
//        next(createError401());
//        return;
//    }
//
//    if (id === 'all') {
//        promise = dataProvider.promisePostRemoveAll();
//    } else {
//        promise = dataProvider.promisePostRemove(id);
//    }
//
//    promise
//        .then(function (result) {
//            // result can be simple value!
//            return res.json(result);
//        })
//        .then(null, next);
//});
//
//router.post('/post', function (req, res, next) {
//    var formData = req.body,
//        id = formData._id,
//        promise;
//
//    if (!req.userHasAdminRights) {
//        next(createError401());
//        return;
//    }
//
//    if (id) {
//        promise = dataProvider.promisePostUpdate(formData);
//    } else {
//        promise = dataProvider.promisePostCreate(formData);
//    }
//
//    promise
//        .then(function (result) {
//            return res.send(result);
//        })
//        .then(null, next);
//});
//
//router.post('/post/draft', function (req, res, next) {
//    var formData = req.body,
//        promise;
//
//    if (!req.userHasAdminRights) {
//        next(createError401());
//        return;
//    }
//
//    promise = dataProvider.promisePostDraftUpdate(formData);
//    promise.then(function (result) {
//        return res.send(result);
//    }).then(null, next);
//});
//
//router.post('/post/featured', function (req, res, next) {
//    var formData = req.body,
//        promise;
//
//    if (!req.userHasAdminRights) {
//        next(createError401());
//        return;
//    }
//
//    promise = dataProvider.promisePostFeaturedUpdate(formData);
//    promise.then(function (result) {
//        return res.send(result);
//    }).then(null, next);
//});
//
//router.get('/post', function (req, res, next) {
//    var id = req.query.id,
//        slug = req.query.slug,
//        promise;
//
//    if (id) {
//        promise = dataProvider.promisePostGetById(id);
//    } else if (slug) {
//        promise = dataProvider.promisePostGetBySlug(slug);
//    } else {
//        next(createError(400, 'id or slug required'));
//        return;
//    }
//
//    promise
//        .then(function (result) {
//            if (!result) {
//                next(createError(404, 'No such post'));
//                return;
//            }
//            if (result.draft && !req.userHasAdminRights) {
//                next(createError401());
//                return;
//            }
//            res.send(result);
//        })
//        .then(null, next);
//});
//
//router.get('/posts', function (req, res, next) {
//    if (req.query.includeDraft && !req.userHasAdminRights) {
//        next(createError401()); // unauthorized
//        return;
//    }
//
//    dataProvider.promisePostsList(req.query)
//        .then(function (result) {
//            res.send(result);
//        })
//        .then(null, next);
//});
//
//router.get('/navlinks', function (req, res, next) {
//    var query = req.query;
//    dataProvider.promiseNavlinkList(query.category)
//        .then(function (result) {
//            return res.send(result);
//        })
//        .then(null, next);
//});
//
//router.post('/navlink', function (req, res, next) {
//    var formData = req.body,
//        id = formData._id,
//        promise;
//
//    if (!req.userHasAdminRights) {
//        next(createError401());
//        return;
//    }
//
//    if (id) {
//        promise = dataProvider.promiseNavlinkUpdate(formData);
//    } else {
//        promise = dataProvider.promiseNavlinkCreate(formData);
//    }
//
//    promise
//        .then(function (result) {
//            return res.send(result);
//        })
//        .then(null, next);
//});
//
//router.delete('/navlink', function (req, res, next) {
//    var id = req.query.id,
//        promise;
//
//    if (!id) {
//        next(createError400('id'));
//        return;
//    }
//
//    if (!req.userHasAdminRights) {
//        next(createError401());
//        return;
//    }
//
//    promise = dataProvider.promiseNavlinkRemove(id);
//
//    promise
//        .then(function (result) {
//            return res.send(result);
//        })
//        .then(null, next);
//});
//
//router.get('/locale', function (req, res) {
//    var langCode = req.query.lang || 'en',
//        localeTable = locales[langCode] || locales[langCode.slice(0, 2)] || locales.en;
//
//    res.send(localeTable);
//});
//
//router.post('/upload', multipartMiddleware, function (req, res, next) {
//    if (!req.userHasAdminRights) {
//        fileUtils.removeTempFiles(req.files);
//        next(createError401());
//        return;
//    }
//
//    if (!req.files) {
//        next(createError400('files'));
//        return;
//    }
//
//    if (req.files.hasOwnProperty('file_json_posts')) {
//        importPosts.importFromFile(req.files['file_json_posts'].path)
//            .then(function (result) {
//                var f = arguments;
//                return res.send(result);
//            }, next);
//    } else {
//        fileUtils.saveTempFilesPromise(req.files, 'upload')
//            .then(function (result) {
//                return res.send(result);
//            })
//            .then(null, next);
//    }
//});
//
//router.get('/upload', function (req, res, next) {
//    if (!req.userHasAdminRights) {
//        next(createError401());
//        return;
//    }
//
//    fileUtils.readDirPromise('upload')
//        .then(function (files) {
//            return res.send(files);
//        })
//        .then(null, next);
//});
//
//router.delete('/upload', function (req, res, next) {
//    var relativePath = req.body.path
//
//    if (!req.userHasAdminRights) {
//        next(createError401());
//        return;
//    }
//
//    fileUtils.removeFilePromise(relativePath)
//        .then(function (result) {
//            res.send(result);
//        })
//        .then(null, next);
//});

router.get('/settings', function (req, res, next) {
    dataProvider.promiseSettings()
        .then(function (result) {
            return res.send(result);
        })
        .then(null, next);
});

//router.post('/settings', function (req, res, next) {
//    var settings = req.body;
//
//    if (!req.userHasAdminRights) {
//        next(createError401());
//        return;
//    }
//
//    dataProvider.promiseSettingsUpdate(settings)
//        .then(function (result) {
//            return res.send(result);
//        })
//        .then(null, next);
//});
//
//router.get('/log', function (req, res, next) {
//    if (!req.userHasAdminRights) {
//        next(createError401());
//        return;
//    }
//
//    dataProvider.promiseLogEntries(req.query)
//        .then(function (result) {
//            return res.send(result);
//        })
//        .then(null, next);
//});
//
///**
// * GET viewmodel for use in single-page updates,
// * we use same params as GET /
// */
//router.get('/vm', function (req, res, next) {
//    var preferredLocale = req.preferredLocale,
//        skip = parseInt(req.query.skip, 10) || 0,
//        tag = req.query.tag,
//        clientUrl = urlHelper.moveQueryParams('/', req.originalUrl);
//
//    indexVm.promise({
//        preferredLocale: preferredLocale,
//        skip: skip,
//        user: req.user,
//        admin: req.userHasAdminRights,
//        url: clientUrl,
//        tag: tag
//    }).then(function (vm) {
//        vm.pageUrl = urlHelper.combine(urlHelper.hostUrl, clientUrl);
//        delete vm.user;
//        delete vm.preferredLocale;
//        delete vm.navlinksFooter;
//        delete vm.navlinksMain;
//        delete vm.settings;
//        res.json(vm);
//    }).then(null, next);
//});
//
//router.get('/vm/post/:slug?', function (req, res, next) {
//    var slug = req.params.slug,
//        id = req.query.id,
//        locale = req.preferredLocale,
//        clientUrl;
//
//    postVm.promise({
//        preferredLocale: locale,
//        id: id,
//        slug: slug,
//        user: req.user,
//        admin: req.userHasAdminRights,
//        queryParams: {
//            includeDrafts: false
//        }
//    }).then(function (vm) {
//        if (slug) {
//            clientUrl = urlHelper.moveQueryParams('/post/' + slug, req.originalUrl);
//        } else {
//            clientUrl = urlHelper.moveQueryParams('/post', req.originalUrl);
//        }
//
//        vm.pageUrl = urlHelper.combine(urlHelper.hostUrl, clientUrl);
//        delete vm.user;
//        delete vm.preferredLocale;
//        delete vm.navlinksFooter;
//        delete vm.navlinksMain;
//        delete vm.settings;
//        return res.json(vm);
//    }).then(null, next);
//});

module.exports = router;