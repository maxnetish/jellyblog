import {Secret, SignOptions} from "jsonwebtoken";

function getTokenSignOptions(): SignOptions{
    return {
        algorithm: 'HS256',
        expiresIn: process.env.JWT_EXPIRES_IN || '1h',
        notBefore: 0,
        audience: process.env.JWT_AUDIENCE || 'PRIVATE',
        issuer: process.env.JWT_ISSUER || 'PRIVATE',
    };
}

function getSecret(): string | Buffer {
    return process.env.JWT_SECRET || 'Secret key';
}

function getRefreshTokenCookieKey(): string {
    return process.env.JWT_REFRESH_TOKEN_COOKIE || 'jb-rt';
}

function getRefreshTokenExpiresInDays(): number {
    return parseInt(process.env.JWT_REFRESH_TOKEN_EXPIRES_IN_DAYS || '30', 10);
}

export {
    getTokenSignOptions,
    getSecret,
    getRefreshTokenCookieKey,
    getRefreshTokenExpiresInDays,
}
