/**
 * Created by Gordeev on 12.06.2014.
 */
var express = require('express'),
    router = express.Router(),
    passport = require('passport'),
    create401 = function () {
        var result = new Error('Auth required');
        result.status = 401;
        return result;
    };

router.get('/google', passport.authenticate('google', { scope: 'email' }));

router.get('/google/return', function (req, res, next) {
    passport.authenticate('google', function (err, user, info) {
        if (err) {
            return next(err);
        }
        if (!user) {
            return next(create401());
        }
        req.logIn(user, function (err) {
            if (err) {
                return next(err);
            }
            if (req.session.after) {
                return res.redirect(req.session.after);
            } else {
                return res.redirect('/admin');
            }
        });
    })(req, res, next);
});

router.get('/logout', function (req, res) {
    if (req.user) {
        req.logout();
    }
    res.redirect('/admin');
});

module.exports = router;