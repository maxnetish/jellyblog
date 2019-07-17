import Router = require('koa-router');
import {Context} from "koa";
import {routesMap} from './user-routes-map'
import {IUserNewPassword} from "../dto/user-new-password";
import {userNewPasswordSchema} from "../dto/user-new-password.schema";
import {IUserContext} from "../api/user-context";
import {IUserService} from "../api/user-service";
import {TYPES} from "../../ioc/types";
import {container} from "../../ioc/container";
import {IJoiValidationMiddlewareFactory} from "../../utils/api/joi-validation-middleware";

const router = new Router({
    prefix: routesMap.prefix,
});

const userService: IUserService = container.get<IUserService>(TYPES.UserService);
const joiValidateMiddlewareFactory = container.get<IJoiValidationMiddlewareFactory>(TYPES.JoiValidationMiddlewareFactory);

router.post(routesMap['user-change-password'],
    joiValidateMiddlewareFactory({body: userNewPasswordSchema}),
    async (context: Context) => {
        const userNewPassword: IUserNewPassword = context.request.body;

        (context.state.user as IUserContext).assertAuth([
            {role: ['admin']},
            {username: [userNewPassword.username]}
        ]);

        const result = await userService.changePassword(userNewPassword, {
            user: context.state.user
        });
        context.status = result ? 201 : 403;
    });


export {
    router,
};
