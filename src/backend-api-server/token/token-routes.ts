// @ts-ignore
import Router from 'koa-router';
// @ts-ignore
import {routesMap} from '../../config/routes-map';
import {ICredentials} from "../auth/credentials";
import {findUserInfo} from "../auth/user-service";
import jsonwebtoken from 'jsonwebtoken';

const router = new Router({
    prefix: routesMap.get('token')
});

router.post('token-get', '/', async context => {
    const credentials: ICredentials = context.request.body;

    const foundUserInfo = await findUserInfo(credentials);

    if(!foundUserInfo) {
        // auth failed
        context.status = 403;
        context.state.errMessage = 'Authentication failed';
        context.body = {
            message: context.state.errMessage,
            user: null,
        };
        return;
    }

    const jwtSecret = process.env.JWT_SECRET || 'Default secret';
    const expiresIn = process.env.JWT_EXPIRES_IN || '1h';
    const audience = process.env.JWT_AUDIENCE || undefined;
    const issuer = process.env.JWT_ISSUER || undefined;

    // auth success, create token
    const jwt = jsonwebtoken.sign(foundUserInfo, jwtSecret, {
        algorithm: 'HS256',
        expiresIn,
        notBefore: 0,
        audience,
        issuer,
    });

    context.body = {
        token: jwt
    };
});


export {
    router
};
