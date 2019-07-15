import {UserModel, IUserModel} from "./user-model";
import {ICredentials} from "./credentials";
import crypto from 'crypto';
import {IUserInfo} from "./user-info";
import {IUserNewPassword} from "./user-new-password";
import {IWithUserContext} from "./with-user-context";
import {IUserCreateNew} from "./user-create-new";
import {IFindUsersCriteria} from "./find-users-criteria";
import {IResponseWithPagination} from "../utils/response-with-pagination";

const defaultAdmin: IUserInfo = {
    // default admin account
    role: 'admin',
    username: 'admin'
};

function getDefaultAdminPassword() {
    return process.env.DEFAULT_ADMIN_PASSWORD || 'changeimmediately';
}

async function findUserInfoByCredentials(credentials: ICredentials): Promise<IUserInfo | null> {
    const condition: Partial<IUserModel> = {
        username: credentials.username
    };

    const foundUser = await UserModel.findOne(condition).exec();

    if (!foundUser) {
        if (credentials.username === defaultAdmin.username && credentials.password === getDefaultAdminPassword()) {
            // pass if admin login first time
            return defaultAdmin;
        }
        return null;
    }

    if (foundUser.password !== textToHash(credentials.password)) {
        return null;
    }

    return {
        username: foundUser.username,
        role: foundUser.role,
    };
}

async function findUserInfoByUsername(name: string, options: IWithUserContext): Promise<IUserInfo | null> {
    options.user.assertAuth([
        {username: [name]},
        {role: ['admin']}
    ]);

    const condition: Partial<IUserModel> = {
        username: name
    };

    const foundUser = await UserModel.findOne(condition).exec();

    if (!foundUser) {
        return null;
    }

    const {username, role} = foundUser;
    return {
        username,
        role
    };
}

async function changePassword(userNewPassword: IUserNewPassword, options: IWithUserContext): Promise<boolean> {
    // require any authenticated user
    options.user.assertAuth('ANY');

    const userInfo = await findUserInfoByCredentials(userNewPassword);

    if (!userInfo) {
        return false;
    }

    await UserModel.updateOne({
        username: userNewPassword.username
    }, {
        // username needed if admin change password first time
        // we have to create new doc for admin
        username: userNewPassword.username,
        password: textToHash(userNewPassword.newPassword)
    }, {
        // need if admin change password first time
        upsert: true
    }).exec();
    return true;
}

async function addUser(userCreateNew: IUserCreateNew, options: IWithUserContext): Promise<IUserInfo> {
    options.user.assertAuth([{role: ['admin']}]);

    const userModel = await UserModel.create({
        username: userCreateNew.username,
        role: userCreateNew.role,
        passowrd: userCreateNew.password,
    });

    return {
        username: userModel.username,
        role: userModel.role,
    };
}

async function removeUser(username: string, options: IWithUserContext): Promise<boolean> {
    options.user.assertAuth([
        {role: ['admin']},     // one of admins
        {username: [username]} // or user someself
    ]);

    await UserModel.deleteOne({
        username
    })
        .exec();

    return true;
}

async function findUsers(findUsersCriteria: IFindUsersCriteria, options: IWithUserContext): Promise<IResponseWithPagination<IUserInfo>> {
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

    const found = await UserModel
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

function textToHash(inp: string): string {
    const hash = crypto.createHash('sha256');
    hash.update(inp);
    return hash.digest('hex').toUpperCase();
}

export {
    findUserInfoByCredentials,
    findUserInfoByUsername,
    changePassword,
    addUser,
    removeUser,
    findUsers,
}



