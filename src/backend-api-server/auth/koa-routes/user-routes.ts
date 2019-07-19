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
import {userCreateNewSchema} from "../dto/user-create-new.schema";
import {IUserCreateNew} from "../dto/user-create-new";
import {IUserAuthorizeMiddlewareFactory} from "../api/user-authorize-middleware-factory";
import {IUserRemove} from "../dto/user-remove";
import {userRemoveSchema} from "../dto/user-remove.schema";
import {IFindUsersCriteria} from "../dto/find-users-criteria";
import {findUsersCriteriaSchema} from "../dto/find-users-criteria.schema";

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

    private userAdd: Middleware = async ctx => {
        const userCreateNew: IUserCreateNew = ctx.request.body;
        const userContext: IUserContext = ctx.state.user;

        const result = await this.userService.addUser(userCreateNew, {user: userContext});
        ctx.body = result;
    };

    private userRemove: Middleware = async ctx => {
        const userRemove: IUserRemove = ctx.request.body;
        const userContext: IUserContext = ctx.state.user;

        const result = await this.userService.removeUser(userRemove.username, {user: userContext});
        ctx.status = result ? 204 : 403;
    };

    private usersList: Middleware = async ctx => {
        const findUsersCriteria: IFindUsersCriteria = ctx.state.query;
        const userContext: IUserContext = ctx.state.user;

        const result = await this.userService.findUsers(findUsersCriteria, {user: userContext});
        ctx.body = result;
    };

    constructor(
        @inject(TYPES.JoiValidationMiddlewareFactory) joiValidationMiddlewareFactory: IJoiValidationMiddlewareFactory,
        @inject(TYPES.UserAuthorizeMiddlewareFactory) userAuthorizeMiddleware: IUserAuthorizeMiddlewareFactory,
        @inject(TYPES.UserService) userService: IUserService,
    ) {
        this.userService = userService;
        this.router.post(
            routesMap['user-change-password'],
            joiValidationMiddlewareFactory({body: userNewPasswordSchema}),
            userAuthorizeMiddleware('ANY'), // admin or user someself - check in service
            this.userChangePassword,
        );
        this.router.post(
            routesMap['user-add'],
            joiValidationMiddlewareFactory({body: userCreateNewSchema}),
            userAuthorizeMiddleware([{role: ['admin']}]),
            this.userAdd
        );
        this.router.delete(
            routesMap['user-remove'],
            joiValidationMiddlewareFactory({body: userRemoveSchema}),
            userAuthorizeMiddleware('ANY'), // admin or user someself - check in service
            this.userRemove
        );
        this.router.get(
            routesMap["users-find"],
            joiValidationMiddlewareFactory({query: findUsersCriteriaSchema}),
            userAuthorizeMiddleware([{role: ['admin']}]),
            this.usersList,
        )
    }

    getAllowedMethodsMiddleware(options?: Router.IRouterAllowedMethodsOptions): Middleware {
        return this.router.allowedMethods(options);
    }

    getRouteMiddleware(): Middleware {
        return this.router.routes();
    }
}

