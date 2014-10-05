/**
 * Created by Gordeev on 12.06.2014.
 */
var config,
    _ = require('underscore');

var init = function (customConfig) {
    var model = require('../../models').model,
        User = model.User,
        passport = require('passport'),
        GoogleStrategy = require('passport-google-oauth').OAuth2Strategy,
        googleRedirectUrl;

    config = customConfig || require('../../config');

    if(_.isArray(config.googleApp.web.redirect_uris)){
        googleRedirectUrl = config.googleApp.web.redirect_uris[0];
    }else{
        googleRedirectUrl = config.googleApp.web.redirect_uris;
    }

    passport.use(new GoogleStrategy({
        clientID: config.googleApp.web.client_id,
        clientSecret: config.googleApp.web.client_secret,
        callbackURL: googleRedirectUrl
    }, function (accessToken, refreshToken, profile, done) {
        User.findOne({openId: profile.id}, function (error, user) {
            if (!error) {
                if (user) {
                    user.emails = profile.emails;
                    user.displayName = profile.displayName;
                    user.save(function (errorSave, savedUser) {
                        if (!errorSave) {
                            done(null, savedUser.toPlainObject());
                        } else {
                            done(errorSave, null);
                        }
                    });
                } else {
                    User.create({
                        openId: profile.id,
                        emails: profile.emails,
                        displayName: profile.displayName
                    }, function (errorCreate, user) {
                        if (!errorCreate) {
                            done(null, user.toPlainObject());
                        } else {
                            done(errorCreate, null);
                        }
                    });
                }
            } else {
                done(error, null);
            }
        });
    }));
    passport.serializeUser(function (user, done) {
        done(null, user.openId);
    });
    passport.deserializeUser(function (id, done) {
        User.findOne({openId: id}, function (error, user) {
            if (!error) {
                done(null, user.toPlainObject());
            } else {
                done(error, null);
            }
        });
    });
};

// injects as middleware
var hasAdminRights = function (req, res, next) {
    var result = false,
        user = req.user;

    if (!user) {
        result = false;
    } else {
        if (_.isArray(user.emails)) {
            result = _.any(user.emails, function (item) {
                return item.value === config.auth.admin;
            });
        } else {
            result = user.emails === config.auth.admin;
        }
    }
    req.userHasAdminRights = result;
    next();
};

module.exports = {
    passportInit: init,
    hasAdminRights: hasAdminRights
};