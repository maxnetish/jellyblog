import {Strategy} from 'passport-local';
import authConfig from '../../config/auth.json';


const localStrategy = new Strategy((username, password, done) => {

    let findedUser = authConfig.find(elem => {
        return elem.userName === username;
    });

    if (!findedUser) {
        return done(null, false, {message: 'Incorrect login'});
    }

    if (findedUser.password !== password) {
        return done(null, false, {message: 'Incorrect login'});
    }

    return done(null, {
        userName: findedUser.userName,
        role: findedUser.role
    });
});

function setupPassport(passport) {
    passport.use(localStrategy);

    passport.serializeUser(function (user, done) {
        done(null, user.userName);
    });

    passport.deserializeUser(function (id, done) {
        let findedUser = authConfig.find(elem => {
                return elem.userName === id;
            }) || {};
        done(null, {
            userName: findedUser.userName,
            role: findedUser.role
        });
    });

    return passport;
}

export {
    setupPassport
};