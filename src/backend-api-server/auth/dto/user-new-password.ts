import {ICredentials} from "./credentials";
import {IWithUserContext} from "./with-user-context";
import {IUserCreateNew} from "./user-create-new";

export interface IUserNewPassword extends ICredentials {
    newPassword: string;
}

// TODO move to Joi validation
export function userNewPasswordAssertValidation(userNewPassword: IUserNewPassword, toThrow?: number) {
    if (!(userNewPassword &&
        userNewPassword.newPassword.length > 0 && userNewPassword.newPassword.length < 128 &&
        userNewPassword.password.length > 0 && userNewPassword.password.length < 128 &&
        userNewPassword.username.length > 0 && userNewPassword.username.length < 64)) {
        throw toThrow || 400;
    }
}

export function userNewPasswordFromRequest(userNewPassword: any): IUserNewPassword {
    userNewPassword = userNewPassword || {};
    const {newPassword, password, username} = userNewPassword;

    return {
        newPassword: newPassword + '',
        password: password + '',
        username: username + '',
    };
}
