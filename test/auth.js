var Should = require('should'),
    _ = require('underscore'),
    auth = require('../service/auth'),
    config = {
        auth: {
            'admin': 'example@example.com'
        },
        googleApp: {
            web: {
                "auth_uri": "https://accounts.google.com/o/oauth2/auth",
                "client_secret": "client_secret",
                "token_uri": "https://accounts.google.com/o/oauth2/token",
                "client_email": "client_emailg@developer.gserviceaccount.com",
                "redirect_uris": [
                    "http://localhost:3000/auth/google/return"
                ],
                "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/client_x509_cert_url@developer.gserviceaccount.com",
                "client_id": "client_id.apps.googleusercontent.com",
                "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
                "javascript_origins": [
                    "http://localhost:3000"
                ]
            }
        }
    },
    requestWithUser = {
        user: {
            emails: [
                {
                    value: 'example_other@example.com'
                },
                {
                    value: 'example@example.com'
                }
            ]
        }
    },
    requestWithoutUser = {

    },
    requestWithWrongUser = {
        user: {
            emails: [
                {
                    value: 'example_other@example.com'
                },
                {
                    value: 'example_another@example.com'
                }
            ]
        }
    }
    ;

describe('Auth service', function () {
    describe('Should contains props', function () {
        it('passportInit', function () {
            auth.passportInit.should.be.a.Function.with.lengthOf(1);
        });
        it('hasAdminRights (middleware signature)', function () {
            auth.hasAdminRights.should.be.a.Function.with.lengthOf(3);
        });
    });
    describe('hasAdminRights behavior', function(){
        auth.passportInit(config);
        it('hasAdminRights must set true if check success', function () {
            auth.hasAdminRights(requestWithUser, null, _.noop);
            requestWithUser.should.have.property('userHasAdminRights', true);
        });
        it('hasAdminRights must set false if user not set', function () {
            auth.hasAdminRights(requestWithoutUser, null, _.noop);
            requestWithoutUser.should.have.property('userHasAdminRights', false);
        });
        it('hasAdminRights must set false if check fails', function () {
            auth.hasAdminRights(requestWithWrongUser, null, _.noop);
            requestWithWrongUser.should.have.property('userHasAdminRights', false);
        });
        it('hasAdminRights must call next()', function (done) {
            auth.hasAdminRights(requestWithoutUser, null, function () {
                done();
            });
        });
    });
});