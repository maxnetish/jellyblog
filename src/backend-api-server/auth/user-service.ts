import {UserModel, IUser} from "./user-model";
import {ICredentials} from "./credentials";
import crypto from 'crypto';
import {IUserInfo} from "./user-info";
import {IUserNewPassword} from "./user-new-password";
import {IWithUserContext} from "./with-user-context";

const defaultAdmin: IUserInfo = {
    // default admin account
    role: 'admin',
    username: 'admin'
};

function getDefaultAdminPassword() {
    return process.env.DEFAULT_ADMIN_PASSWORD || 'changeimmediately';
}

async function findUserInfoByCredentials(credentials: ICredentials): Promise<IUserInfo | null> {
    const condition: Partial<IUser> = {
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

    const condition: Partial<IUser> = {
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

function textToHash(inp: string): string {
    const hash = crypto.createHash('sha256');
    hash.update(inp);
    return hash.digest('hex').toUpperCase();
}

export {
    findUserInfoByCredentials,
    findUserInfoByUsername,
    changePassword,
}



