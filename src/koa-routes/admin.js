import Router from 'koa-router';
import routesMap from "../../config/routes-map";
import {dump, restore, uploadDumpMiddleware} from "../utils/db-maintenance";
import checkPermissions from './../koa-middleware/check-permission';
import promptLogin from './../koa-middleware/prompt-login';
import mongooseConfig from '../../config/mongoose.json';
import {unlinkSync} from "fs";
import passport from 'koa-passport';

const router = new Router();

const checkAdminPermissions = checkPermissions({roles: ['admin']});

router

    .get('dbDump', routesMap.dbDump,
        checkAdminPermissions,
        ctx => {
            const dumpStream = dump(mongooseConfig);
            const filename = mongooseConfig.dumpFilename || 'db.dump';
            ctx.set({
                'Content-type': 'application/octet-stream',
                'Content-Disposition': `attachment; filename="${filename}"`
            });
            ctx.body = dumpStream;
        })

    .post('dbRestore', routesMap.dbRestore, uploadDumpMiddleware.single('dump'),
        checkAdminPermissions,
        async ctx => {
            let restoreResult;
            try {
                restoreResult = await restore(ctx.req.file, mongooseConfig);
                unlinkSync(ctx.req.file.path);
                ctx.body = restoreResult;
            }
            catch (err) {
                unlinkSync(ctx.req.file.path);
                throw err;
            }
        })

    .get('adminApp', routesMap.admin,
        promptLogin,
        checkAdminPermissions,
        ctx => ctx.render('admin/index'))

    .get('loginPage', routesMap.login, async ctx => {
        if (ctx.state.user && ctx.state.user.role === 'admin') {
            ctx.redirect(routesMap.admin);
        } else {
            ctx.render('admin/login');
        }
    })

    .post('loginFormPost', routesMap.login, (ctx, next) => {

        // to login with xhr request
        const expectedJsonResponse =  ctx.headers.accept && ctx.headers.accept.indexOf('application/json') > -1;

        return passport.authenticate('local', {}, (err, user, info, status) => {
            if (err) {
                // exception
                ctx.throw(500, err); // will generate a 500 error
                return;
            }
            if (!user) {
                // failed login
                ctx.status = status || 403;
                ctx.state.errMessage = info.message || 'Authentication failed';
                if(expectedJsonResponse) {
                    ctx.body = {
                        message: ctx.state.errMessage,
                        user: null
                    };
                } else {
                    ctx.render('admin/login');
                }
                return;
            }
            // ***********************************************************************
            // "Note that when using a custom callback, it becomes the application's
            // responsibility to establish a session (by calling req.login()) and send
            // a response."
            // Source: http://passportjs.org/docs
            // ***********************************************************************
            ctx.login(user);
            if(expectedJsonResponse) {
                ctx.body = {
                    message: 'Auth granted',
                    user: user
                };
            } else {
                ctx.redirect(ctx.query.next || routesMap.admin);
            }
        })(ctx, next);
    })

    .get('logout', routesMap.logout, ctx => {
        // to logout with xhr request
        const expectedJsonResponse =  ctx.headers.accept && ctx.headers.accept.indexOf('application/json') > -1;

        if (ctx.isAuthenticated()) {
            ctx.logout();
            if(expectedJsonResponse) {
                ctx.body = {
                    message: 'Exited',
                    user: null
                };
            } else {
                ctx.redirect(ctx.query.next || '/');
            }
        } else {
            ctx.throw({status: 400});
        }
    })

    .get('userContext', routesMap.userContext, ctx => {
        if(ctx.isAuthenticated()) {
            ctx.body = ctx.state.user;
            return;
        }
        ctx.status = 401;
    })

;

export default router;
