var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function (req, res) {
    res.render('index', {
        title: 'Express',
        user: req.user || {},
        admin: req.userHasAdminRights
    });
});

module.exports = router;
