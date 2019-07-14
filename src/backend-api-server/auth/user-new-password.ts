import {ICredentials} from "./credentials";
import {IWithUserContext} from "./with-user-context";

export interface IUserNewPassword extends ICredentials {
    newPassword: string;
}
