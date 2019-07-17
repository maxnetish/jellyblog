import Router = require('koa-router');
import {Middleware} from "koa";
import {routesMap} from './user-routes-map'
import {IUserNewPassword} from "../dto/user-new-password";
import {userNewPasswordSchema} from "../dto/user-new-password.schema";
import {IUserContext} from "../api/user-context";
import {IUserService} from "../api/user-service";
import {TYPES} from "../../ioc/types";
import {IJoiValidationMiddlewareFactory} from "../../utils/api/joi-validation-middleware";
import {IRouteController} from "../../utils/api/route-controller";
import {inject, injectable} from "inversify";

@injectable()
export class UserController implements IRouteController {

    private readonly router = new Router({
        prefix: routesMap.prefix,
    });

    private readonly userService: IUserService;

    private userChangePassword: Middleware = async ctx => {
        const userNewPassword: IUserNewPassword = ctx.request.body;
        const userContext: IUserContext = ctx.state.user;

        userContext.assertAuth([
            {role: ['admin']},
            {username: [userNewPassword.username]}
        ]);

        const result = await this.userService.changePassword(userNewPassword, {
            user: userContext
        });

        ctx.status = result ? 201 : 403;
    };

    constructor(
        @inject(TYPES.JoiValidationMiddlewareFactory) joiValidationMiddlewareFactory: IJoiValidationMiddlewareFactory,
        @inject(TYPES.UserService) userService: IUserService,
    ) {
        this.userService = userService;
        this.router.post(
            routesMap['user-change-password'],
            joiValidationMiddlewareFactory({body: userNewPasswordSchema}),
            this.userChangePassword
        );
    }

    getAllowedMethodsMiddleware(options?: Router.IRouterAllowedMethodsOptions): Middleware {
        return this.router.allowedMethods(options);
    }

    getRouteMiddleware(): Middleware {
        return this.router.routes();
    }
}

