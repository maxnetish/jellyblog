import {IUserRefreshTokenInfo} from "../dto/user-refresh-token-info";

export interface ITokenService {
    createAndRegisterRefreshToken(username: string): Promise<string>;

    findByToken(refreshToken: string): Promise<IUserRefreshTokenInfo | null>;
}
