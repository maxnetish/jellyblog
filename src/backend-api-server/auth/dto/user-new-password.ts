import {ICredentials} from "./credentials";
import {IWithUserContext} from "./with-user-context";
import {IUserCreateNew} from "./user-create-new";

export interface IUserNewPassword extends ICredentials {
    newPassword: string;
}
