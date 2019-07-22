import {ICredentials} from "./credentials";

export interface IUserNewPassword extends ICredentials {
    newPassword: string;
}
