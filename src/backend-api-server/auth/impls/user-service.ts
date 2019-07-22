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
import {IUserRefreshTokenDocument} from "../../token/api/user-refresh-token-document";
import {IUserChangeRole} from "../dto/user-change-role";
import {IPaginationUtils} from "../../utils/api/pagination-utils";

@injectable()
export class UserService implements IUserService {

    @inject(TYPES.ModelUser)
    private UserModel: Model<IUserDocument>;

    @inject(TYPES.ModelRefreshToken)
    private RefreshTokenModel: Model<IUserRefreshTokenDocument>;

    @inject(TYPES.PaginationUtils)
    private paginationUtils: IPaginationUtils;

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

    async addUser(userCreateNew: IUserCreateNew, options: IWithUserContext): Promise<IUserInfo> {
        options.user.assertAuth([{role: ['admin']}]);
        const userModel = await this.UserModel.create({
            username: userCreateNew.username,
            role: userCreateNew.role,
            password: this.textToHash(userCreateNew.password),
        });

        return {
            username: userModel.username,
            role: userModel.role,
        };
    }

    async changePassword(userNewPassword: IUserNewPassword, options: IWithUserContext): Promise<boolean> {
        // require user someself
        options.user.assertAuth([{username: [userNewPassword.username]}]);

        const userInfo = await this.findUserInfoByCredentials(userNewPassword);

        if (!userInfo) {
            return false;
        }

        const findDoc: Partial<ICredentials> = {
            username: userNewPassword.username
        };

        const updateDoc: Partial<IUserInfo & ICredentials> = {
            password: this.textToHash(userNewPassword.newPassword)
        };

        // special for admin
        // to force admin role and creating new admin account if
        if (userNewPassword.username === this.defaultAdmin.username) {
            updateDoc.username = this.defaultAdmin.username;
            updateDoc.role = this.defaultAdmin.role;
        }

        const updateOpts = {
            // need if admin change password first time
            upsert: true
        };

        await this.UserModel.updateOne(findDoc, updateDoc, updateOpts).exec();
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

        const {skip, limit, page} = this.paginationUtils.skipLimitFromPaginationRequest(findUsersCriteria);

        const found = await this.UserModel
            .find(clearedCriteria, 'username role')
            .skip(skip)
            .limit(limit + 1)
            .exec();

        return {
            hasMore: found.length > limit,
            items: found.slice(0, limit),
            itemsPerPage: limit,
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

        // also remove refresh tokens of removed user else user can get access_token by refresh token
        // if removed user have valid access_token, access_token will be valid until expires time pass (default 2h)
        await this.RefreshTokenModel.deleteMany({
            username
        });

        return true;
    }

    async changeRole(userChangeRole: IUserChangeRole, options: IWithUserContext): Promise<boolean> {
        options.user.assertAuth([
            {role: ['admin']}
        ]);

        const findDoc: Partial<ICredentials> = {
            username: userChangeRole.username
        };

        const updateDoc: Partial<IUserInfo & ICredentials> = {
            role: userChangeRole.role
        };

        // special for admin
        // to force admin role
        if (userChangeRole.username === this.defaultAdmin.username) {
            updateDoc.username = this.defaultAdmin.username;
            updateDoc.role = this.defaultAdmin.role;
        }

        const updateOpts = {
            // need if admin change password first time
            upsert: true
        };

        await this.UserModel.updateOne(findDoc, updateDoc, updateOpts).exec();
        return true;
    }
}



