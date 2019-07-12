import Router = require('koa-router');
import {changePassword} from "../auth/user-service";
import {Context} from "koa";
import {routesMap} from './user-routes-map'
import {IUserNewPassword} from "./user-new-password";

const router = new Router({
    prefix: routesMap.prefix,
});

router.post(routesMap['user-change-password'], async (context: Context) => {
    const userNewPassword: IUserNewPassword = context.request.body;

    const result = await changePassword(userNewPassword);
    if (result) {
        context.status = 201;
    } else {
        context.status = 403;
    }
});

export {
    router,
};
