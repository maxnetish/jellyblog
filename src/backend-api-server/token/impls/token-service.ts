import crypto from 'crypto';
import {
    IUserRefreshTokenInfo,
    IUserRefreshTokenModel,
    UserRefreshTokenModel
} from "../mongoose-model/user-refresh-token-model";
import {addDays} from 'date-fns';
import {ITokenOptions} from "../api/token-options";
import {TYPES} from "../../ioc/types";
import {ITokenService} from "../api/token-service";
import {inject, injectable} from "inversify";

@injectable()
export class TokenService implements ITokenService {
    // TODO method to remove expired tokens (or make mongo collection capped)

    @inject(TYPES.JwtTokenOptions)
    private _tokenOptions: ITokenOptions;

    private generateRefreshToken(): Promise<string> {
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

    async createAndRegisterRefreshToken(username: string): Promise<string> {
        const refreshToken = await this.generateRefreshToken();
        const validBefore = addDays(new Date(), this._tokenOptions.getRefreshTokenExpiresInDays());
        const userRefreshToken: Partial<IUserRefreshTokenInfo> = {
            token: refreshToken,
            username,
            validBefore,
        };
        await UserRefreshTokenModel.create(userRefreshToken);
        return refreshToken;
    }

    async findByToken(refreshToken: string): Promise<IUserRefreshTokenInfo | null> {
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
}
