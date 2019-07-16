import {SignOptions} from "jsonwebtoken";

export interface ITokenOptions {
    getTokenSignOptions(): SignOptions,

    getSecret(): string | Buffer,

    getRefreshTokenCookieKey(): string,

    getRefreshTokenExpiresInDays(): number,
}
