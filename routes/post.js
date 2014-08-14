/**
 * Created by mgordeev on 14.08.2014.
 */
var express = require('express'),
    router = express.Router(),
    errResponse = require('../service/errResponse');

router.get('/:idOrSlug', function(req, res){



    errResponse({
        status: 404,
        message: 'Under construction, idOrSlug: '+req.params.idOrSlug
    }, req, res);
});

module.exports = router;