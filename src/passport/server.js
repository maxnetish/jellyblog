import {Strategy} from 'passport-local';
import authConfig from '../../config/auth.json';
import {Router} from 'express';
import passport from 'passport';


const localStrategy = new Strategy((username, password, done) => {
    let findedUser = authConfig.find(elem => {
        return elem.userName === username;
    });

    if (!findedUser) {
        return done(null, false);
    }

    if (findedUser.password !== password) {
        return done(null, false);
    }

    return done(null, {
        userName: findedUser.userName,
        role: findedUser.role
    });
});

const router = Router();

router.route('/')
    .get((req, res) => res.json(req.user || {}));
router.route('/login')
    .post(passport.authenticate('local'), (req, res) => {
        res.send(req.user); // send user context
    });
router.route('/logout')
    .post((req, res) => {
        req.logout();
        res.send(req.user || {}); // send empty user context
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
    setupPassport,
    router as authRoutes
};