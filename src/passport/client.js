import request from 'superagent';
import {keyOfUserContext} from '../isomorph-utils/shared';

function authGet() {
    return new Promise((resolve, reject) => {
        request
            .get('/auth')
            .end((err, res) => {
                if (err || !res.ok) {
                    reject(err);
                } else {
                    resolve(res.body);
                }
            });
    });
}

function authLogin(loginData) {
    return new Promise((resolve, reject) => {
        request
            .post('/auth/login')
            .send(loginData)
            .end((err, res) => {
                if (err || !res.ok) {
                    reject(err);
                } else {
                    resolve(res.body);
                }
            });
    });
}

function authLogout() {
    return new Promise((resolve, reject) => {
        request
            .post('/auth/logout')
            .end((err, res) => {
                if (err || !res.ok) {
                    reject(err);
                } else {
                    resolve(res.body);
                }
            });
    });
}

function setUserContext(userContext) {
    window[keyOfUserContext] = Object.assign({}, userContext);
}

export {
    authGet,
    authLogin,
    authLogout,
    setUserContext
};