import Router = require('koa-router');
import {changePassword} from "../user-service";
import {Context} from "koa";
import {routesMap} from './user-routes-map'
import {userNewPasswordAssertValidation, IUserNewPassword, userNewPasswordFromRequest} from "../dto/user-new-password";
import {UserContext} from "../user-context";

const router = new Router({
    prefix: routesMap.prefix,
});

router.post(routesMap['user-change-password'], async (context: Context) => {
    const userNewPassword: IUserNewPassword = userNewPasswordFromRequest(context.request.body);

    userNewPasswordAssertValidation(userNewPassword);
    (context.state.user as UserContext).assertAuth([
        {role: ['admin']},
        {username: [userNewPassword.username]}
    ]);

    const result = await changePassword(userNewPassword, {
        user: context.state.user
    });
    context.status = result ? 201 : 403;
});


export {
    router,
};
