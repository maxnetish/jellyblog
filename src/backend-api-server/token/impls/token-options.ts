import {SignOptions} from "jsonwebtoken";
import {injectable} from "inversify";
import {ITokenOptions} from "../api/token-options";

@injectable()
export class TokenOptions implements ITokenOptions{
    getRefreshTokenCookieKey(): string {
        return process.env.JWT_REFRESH_TOKEN_COOKIE || 'jb-rt';
    }

    getRefreshTokenExpiresInDays(): number {
        return parseInt(process.env.JWT_REFRESH_TOKEN_EXPIRES_IN_DAYS || '30', 10);
    }

    getSecret(): string | Buffer {
        return process.env.JWT_SECRET || 'Secret key';
    }

    getTokenSignOptions(): SignOptions {
        return {
            algorithm: 'HS256',
            expiresIn: process.env.JWT_EXPIRES_IN || '1h',
            notBefore: 0,
            audience: process.env.JWT_AUDIENCE || 'PRIVATE',
            issuer: process.env.JWT_ISSUER || 'PRIVATE',
        };
    }
}
