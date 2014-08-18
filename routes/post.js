/**
 * Created by mgordeev on 14.08.2014.
 */
var express = require('express'),
    router = express.Router(),
    errResponse = require('../service/errResponse'),
    postVm = require('../service/vm/postVm'),
    urlHelper = require('../service/urlHelper');

router.get('/:slug?', function(req, res){
    var slug = req.params.slug,
        id = req.query.id,
        locale = req.preferredLocale,
        urlOrigin;

    if(id){
        urlOrigin = urlHelper.removeQueryParam(req.originalUrl, 'id');
    }else if(slug){
        urlOrigin = urlHelper.removeLastPart(req.originalUrl);
    }

    postVm.promise({
        preferredLocale: locale,
        id: id,
        slug: slug,
        user: req.user,
        admin: req.userHasAdminRights,
        url: urlOrigin,
        queryParams: {}
    })
        .then(function(vm){
            res.render('public/post', vm);
            return vm;
        }).then(null, function(err){
            errResponse(err, req, res);
            return err;
        });
});

module.exports = router;