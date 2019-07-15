import {ICredentials} from "./credentials";
import {USER_ROLES} from "./user-roles";

export interface IUserCreateNew extends ICredentials {
    role: USER_ROLES
}

export function assertValidate(userCreateNew: any, toThrow: number = 400) {
    if (!(userCreateNew &&
        typeof userCreateNew.username === 'string' && userCreateNew.username.length > 0 && userCreateNew.username.length < 64 &&
        typeof userCreateNew.role === 'string' && userCreateNew.role.length > 0 && userCreateNew.role.length < 64 &&
        typeof userCreateNew.password === 'string' && userCreateNew.password.length > 0 && userCreateNew.password.length < 128)) {
        throw toThrow;
    }
}

export function fromAny(userCreateNew: any): IUserCreateNew {
    const {username, role, password} = userCreateNew;

    return {
        username: username + '',
        password: password + '',
        role: role as USER_ROLES,
    };
}
