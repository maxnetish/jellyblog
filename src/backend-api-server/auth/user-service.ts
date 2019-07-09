import {UserModel, IUser, IUserInfo} from "./user-model";
import {ICredentials} from "./credentials";
import crypto from 'crypto';

async function findUserInfo(credentials: ICredentials): Promise<IUserInfo | null> {
    const condition: Partial<IUser> = {
        username: credentials.username
    };

    const foundUser = await UserModel.findOne(condition).exec();

    if (!foundUser) {
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

function textToHash(inp: string): string {
    const hash = crypto.createHash('sha256');
    hash.update(inp);
    return hash.digest('hex').toUpperCase();
}

export {
    findUserInfo
}



