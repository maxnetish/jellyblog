import {ICredentials} from "./credentials";
import {IWithUserContext} from "./with-user-context";

export interface IUserNewPassword extends ICredentials {
    newPassword: string;
}

export function assertValidation(userNewPassword: any, toThrow?: number) {
    if (!(userNewPassword &&
        typeof userNewPassword.newPassword === 'string' && userNewPassword.newPassword.length > 0 && userNewPassword.newPassword.length < 128 &&
        typeof userNewPassword.password === 'string' && userNewPassword.password.length > 0 && userNewPassword.password.length < 128 &&
        typeof userNewPassword.username === 'string' && userNewPassword.username.length > 0 && userNewPassword.username.length < 64)) {
        throw toThrow || 400;
    }
}
