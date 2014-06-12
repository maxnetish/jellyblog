/**
 * Created by Gordeev on 12.06.2014.
 */
var config = require('../../config'),
    _ = require('underscore');

var init = function () {
    var model = require('../../models').model,
        User = model.User,
        passport = require('passport'),
        GoogleStrategy = require('passport-google').Strategy;

    passport.use(new GoogleStrategy({
        returnURL: config.auth.returnURL,
        realm: config.auth.realm
    }, function (identifier, profile, done) {
        User.findOne({openId: identifier}, function (error, user) {
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
                        openId: identifier,
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
    passport.deserializeUser(function (openId, done) {
        User.findOne({openId: openId}, function (error, user) {
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