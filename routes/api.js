/**
 * Created by mgordeev on 02.06.2014.
 */

var express = require('express');
var router = express.Router();
var locales = require('../locale');
var dataProvider = require('../service/dataProvider');



router.delete('/post', function (req, res) {
    var id = req.query.id,
        promise;

    if (!id) {
        return res.send(400);
    }

    if (!req.userHasAdminRights) {
        return res.send(401);
    }

    promise = dataProvider.promisePostRemove(id);

    promise
        .then(function (result) {
            return res.send(result);
        })
        .then(null, function (err) {
            return res.send(500, err);
        });
});

router.post('/post', function (req, res) {
    var formData = req.body,
        id = formData._id,
        promise;

    if (!req.userHasAdminRights) {
        return res.send(401);
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
        .then(null, function (err) {
            return res.send(500, err);
        });
});

router.get('/post', function (req, res) {
    var id = req.query.id,
        slug = req.query.slug,
        promise;

    if (id) {
        promise = dataProvider.promisePostGetById(id);
    } else if (slug) {
        promise = dataProvider.promisePostGetBySlug(slug);
    } else {
        return res.send(400);
    }

    promise
        .then(function (result) {
            if (result.draft && !req.userHasAdminRights) {
                return res.send(401);
            }

            res.send(result);
        })
        .then(null, function (err) {
            return res.send(500, err);
        });
});

router.get('/posts', function (req, res) {
    if (req.query.includeDraft && !req.userHasAdminRights) {
        return res.send(401); // unauthorized
    }

    dataProvider.promisePostsList(req.query)
        .then(function (result) {
            res.send(result);
        })
        .then(null, function (err) {
            res.send(err);
        });
});

router.get('/locale', function (req, res) {
    var langCode = req.query.lang || 'en',
        localeTable = locales[langCode] || locales[langCode.slice(0, 2)] || locales.en;

    res.send(localeTable);
});


module.exports = router;