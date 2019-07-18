import {ICredentials} from "../dto/credentials";
import crypto from 'crypto';
import {IUserInfo} from "../dto/user-info";
import {IUserNewPassword} from "../dto/user-new-password";
import {IWithUserContext} from "../dto/with-user-context";
import {IUserCreateNew} from "../dto/user-create-new";
import {IFindUsersCriteria} from "../dto/find-users-criteria";
import {IResponseWithPagination} from "../../utils/dto/response-with-pagination";
import {IUserService} from "../api/user-service";
import {inject, injectable} from "inversify";
import {IUserDocument} from "../api/user-document";
import {Model} from "mongoose";
import {TYPES} from "../../ioc/types";

@injectable()
export class UserService implements IUserService {

    private UserModel: Model<IUserDocument>;

    private readonly defaultAdmin: IUserInfo = {
        // default admin account
        role: 'admin',
        username: 'admin'
    };

    private getDefaultAdminPassword() {
        return process.env.DEFAULT_ADMIN_PASSWORD || 'changeimmediately';
    };

    private textToHash(inp: string): string {
        const hash = crypto.createHash('sha256');
        hash.update(inp);
        return hash.digest('hex').toUpperCase();
    };

    constructor(
        @inject(TYPES.ModelUser) UserModel: Model<IUserDocument>,
    ) {
        this.UserModel = UserModel;
    }

    async addUser(userCreateNew: IUserCreateNew, options: IWithUserContext): Promise<IUserInfo> {
        options.user.assertAuth([{role: ['admin']}]);
        const userModel = await this.UserModel.create({
            username: userCreateNew.username,
            role: userCreateNew.role,
            passowrd: userCreateNew.password,
        });

        return {
            username: userModel.username,
            role: userModel.role,
        };
    }

    async changePassword(userNewPassword: IUserNewPassword, options: IWithUserContext): Promise<boolean> {
        // require any authenticated user
        options.user.assertAuth('ANY');

        const userInfo = await this.findUserInfoByCredentials(userNewPassword);

        if (!userInfo) {
            return false;
        }

        await this.UserModel.updateOne({
            username: userNewPassword.username
        }, {
            // username needed if admin change password first time
            // we have to create new doc for admin
            username: userNewPassword.username,
            password: this.textToHash(userNewPassword.newPassword)
        }, {
            // need if admin change password first time
            upsert: true
        }).exec();
        return true;
    }

    async findUserInfoByCredentials(credentials: ICredentials): Promise<IUserInfo | null> {
        const condition: Partial<IUserDocument> = {
            username: credentials.username
        };

        const foundUser = await this.UserModel.findOne(condition).exec();

        if (!foundUser) {
            if (credentials.username === this.defaultAdmin.username && credentials.password === this.getDefaultAdminPassword()) {
                // pass if admin login first time
                return this.defaultAdmin;
            }
            return null;
        }

        if (foundUser.password !== this.textToHash(credentials.password)) {
            return null;
        }

        return {
            username: foundUser.username,
            role: foundUser.role,
        };
    }

    async findUserInfoByUsername(name: string, options: IWithUserContext): Promise<IUserInfo | null> {
        options.user.assertAuth([
            {username: [name]},
            {role: ['admin']}
        ]);

        const condition: Partial<IUserDocument> = {
            username: name
        };

        const foundUser = await this.UserModel.findOne(condition).exec();

        if (!foundUser) {
            return null;
        }

        const {username, role} = foundUser;
        return {
            username,
            role
        };
    }

    async findUsers(findUsersCriteria: IFindUsersCriteria, options: IWithUserContext): Promise<IResponseWithPagination<IUserInfo>> {
        options.user.assertAuth([{role: ['admin']}]);

        const clearedCriteria: IFindUsersCriteria = {};
        if (findUsersCriteria.username) {
            clearedCriteria.username = typeof findUsersCriteria.username === 'string' ? new RegExp(findUsersCriteria.username, 'i') : findUsersCriteria.username;
        }
        if (findUsersCriteria.role && findUsersCriteria.role.length) {
            clearedCriteria.role = findUsersCriteria.role;
        }

        const itemsPerPage = parseInt(process.env.DB_DEFAULT_PAGINATION || '10', 10) || 10;
        let {page} = findUsersCriteria;
        page = page || 1;
        const skip = itemsPerPage * (page - 1);
        const limit = itemsPerPage + 1;

        const found = await this.UserModel
            .find(clearedCriteria, 'username role')
            .skip(skip)
            .limit(limit)
            .exec();

        return {
            hasMore: found.length > itemsPerPage,
            items: found.slice(0, itemsPerPage),
            itemsPerPage,
            page,
        };
    }

    async removeUser(username: string, options: IWithUserContext): Promise<boolean> {
        options.user.assertAuth([
            {role: ['admin']},     // one of admins
            {username: [username]} // or user someself
        ]);

        await this.UserModel.deleteOne({
            username
        })
            .exec();

        // TODO remove tokens of removed user from RefreshToken collection

        return true;
    }
}



