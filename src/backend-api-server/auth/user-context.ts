import {IUserInfo} from "./user-info";
import {USER_ROLES} from "./user-roles";
import {IAuthorizeParams} from "./authorize-params";

export class UserContext implements Readonly<IUserInfo> {
    public readonly role: USER_ROLES;
    public readonly username: string;
    public readonly authenticated: boolean;

    constructor(userInfo?: IUserInfo) {
        if (userInfo) {
            this.role = userInfo.role;
            this.username = userInfo.username;
            this.authenticated = true;
        } else {
            this.authenticated = false;
        }
    }

    private check(required: IAuthorizeParams[] | 'ANY'): boolean {
        if (!this.authenticated) {
            return false;
        }

        if (required === 'ANY') {
            // nothing to futher check
            return true;
        }

        return required.some(param => {
            if (param.username && param.username.length && !param.username.includes(this.username)) {
                return false;
            }

            if (param.role && param.role.length && !param.role.includes(this.role)) {
                return false;
            }

            return true;
        });
    }

    private throwError(toThrow?: number | string | { message?: string, status?: string, statusCode?: number }) {
        throw (toThrow || (this.authenticated ? 401 : 403));
    }

    public assertAuth(required: IAuthorizeParams[] | 'ANY', toThrow?: number | string | { message?: string, status?: string, statusCode?: number }) {
        if (!this.check(required)) {
            this.throwError(toThrow);
        }
    }
}
