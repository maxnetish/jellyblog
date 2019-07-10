import crypto from 'crypto';
import {IUserRefreshTokenInfo, IUserRefreshTokenModel, UserRefreshTokenModel} from "./user-refresh-token-model";
import {addDays} from 'date-fns';
import {getRefreshTokenExpiresInDays} from "./token-options";

async function generateRefreshToken(): Promise<string> {
    return new Promise<string>((resolve, reject) => {
        crypto.randomBytes(20, (err, buf) => {
            if (err) {
                reject(err);
                return;
            }
            resolve(buf.toString('hex').toUpperCase());
        });
    });
}

async function createAndRegisterRefreshToken(username: string): Promise<string> {
    const refreshToken = await generateRefreshToken();
    const validBefore = addDays(new Date(), getRefreshTokenExpiresInDays());
    const userRefreshToken: Partial<IUserRefreshTokenInfo> = {
        token: refreshToken,
        username,
        validBefore,
    };
    await UserRefreshTokenModel.create(userRefreshToken);
    return refreshToken;
}

async function findByToken(refreshToken: string): Promise<IUserRefreshTokenInfo | null> {
    const userRefreshToken = await UserRefreshTokenModel.findOne({
        token: refreshToken
    }).exec();
    if (!userRefreshToken) {
        return null;
    }
    const {token, username, validBefore} = userRefreshToken;
    return {
        token,
        username,
        validBefore,
    };
}

// TODO method to remove expired tokens (or make mongo collection capped)

export {
    createAndRegisterRefreshToken,
    findByToken,
}

