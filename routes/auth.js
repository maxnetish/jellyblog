/**
 * Created by Gordeev on 12.06.2014.
 */
var express = require('express'),
    router = express.Router(),
    passport = require('passport');

router.get('/google', passport.authenticate('google'));

router.get('/google/return', function (req, res, next) {
    passport.authenticate('google', function (err, user, info) {
        if (err) {
            return next(err);
        }
        if (!user) {
            return res.redirect('/auth/google')
        }
        req.logIn(user, function (err) {
            if (err) {
                return next(err);
            }
            if (req.session.after) {
                return res.redirect(req.session.after);
            } else {
                return res.redirect('/');
            }
        })
    })(req, res, next);
});
/*
 router.get('/google/return', passport.authenticate('google', {
 successRedirect: '/',
 failureRedirect: '/'
 }));

 app.get('/login', function(req, res, next) {
 passport.authenticate('local', function(err, user, info) {
 if (err) { return next(err); }
 if (!user) { return res.redirect('/login'); }
 req.logIn(user, function(err) {
 if (err) { return next(err); }
 return res.redirect('/users/' + user.username);
 });
 })(req, res, next);
 });
 */

router.get('/logout', function (req, res) {
    if (req.user) {
        req.logout();
    }
    res.redirect('/');
});

module.exports = router;