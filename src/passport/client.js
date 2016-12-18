import request from 'superagent';
import {keyOfUserContext} from '../isomorph-utils/shared';

function authGet() {
    return request
        .get('/auth')
        .then(response => response.body);
}

function authLogin(loginData) {
    return request
        .post('/auth/login')
        .send(loginData)
        .then(response => response.body);
}

function authLogout() {
    return request
        .post('/auth/logout')
        .then(response => response.body);
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