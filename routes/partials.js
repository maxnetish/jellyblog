/**
 * Created by Gordeev on 14.06.2014.
 */

var express = require('express');
var router = express.Router();


router.get('/:template', function (req, res) {
    res.render('partials/' + req.params.template, {});
});

module.exports = router;