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
        return passport.authenticate('local', {}, (err, user, info, status) => {
            if (err) {
                // exception
                ctx.throw(500, err); // will generate a 500 error
                return;
            }
            if (!user) {
                // failed login
                ctx.status = 403;
                ctx.state.errMessage = 'Authentication failed';
                ctx.render('admin/login');
                return;
            }
            // ***********************************************************************
            // "Note that when using a custom callback, it becomes the application's
            // responsibility to establish a session (by calling req.login()) and send
            // a response."
            // Source: http://passportjs.org/docs
            // ***********************************************************************
            ctx.login(user);
            ctx.redirect(ctx.query.next || routesMap.admin)
        })(ctx, next);
    })

    .get('logout', routesMap.logout, ctx => {
        if (ctx.isAuthenticated()) {
            ctx.logout();
            ctx.redirect(ctx.query.next || '/');
        } else {
            ctx.throw(400);
        }
    })

;

export default router;