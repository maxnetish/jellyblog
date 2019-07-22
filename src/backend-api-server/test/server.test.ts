import {Server} from "http";
import {promiseForAppRun} from "../server";
import {tearDownHttpAndMongoose} from "./utils";
import request from 'supertest';
import cookie from 'cookie';
import {IUserDocument} from "../auth/api/user-document";
import {Model} from "mongoose";
import {container} from "../ioc/container";
import {TYPES} from "../ioc/types";
import crypto from "crypto";

const textToHash = (inp: string) => {
    const hash = crypto.createHash('sha256');
    hash.update(inp);
    return hash.digest('hex').toUpperCase();
};

let server: Server;
let UserModel: Model<IUserDocument>;

// accounts for testing
const adminUser = {
    username: 'testadmin',
    password: 'testsecret',
    role: 'admin'
};

const readerUser = {
    username: 'testreader',
    password: 'testsecret2',
    role: 'reader'
};

beforeAll(async () => {
    server = await promiseForAppRun;
    UserModel = container.get<Model<IUserDocument>>(TYPES.ModelUser);

    await UserModel.create([
        Object.assign({}, adminUser, {password: textToHash(adminUser.password)}),
        Object.assign({}, readerUser, {password: textToHash(readerUser.password)}),
    ]);
});

afterAll(async () => {
    await UserModel.deleteMany({
        $or: [
            {username: adminUser.username},
            {username: readerUser.username}
        ]
    }).exec();

    await tearDownHttpAndMongoose(server);
});

describe('server.ts', () => {
    it('Server up', () => {
        expect(server).toBeInstanceOf(Server);
    });
});

describe('api/token', () => {
    it('GET api/token should return 404', async () => {
        const response = await request(server).get('/api/token');
        expect(response.status).toEqual(404);
    });
    it('POST api/token with invalid password should return 401, set WWW-authenticate header', async () => {
        const response = await request(server)
            .post('/api/token')
            .send({username: readerUser.username, password: 'wrong_pass'});
        expect(response.status).toEqual(401);
        const wwwAuthHeader = response.get('WWW-Authenticate') || '';
        expect(wwwAuthHeader).toEqual(expect.stringContaining('Bearer'));

    });
    it('POST api/token with invalid username should return 401, set WWW-authenticate header', async () => {
        const response = await request(server)
            .post('/api/token')
            .send({username: 'not-existent', password: 'bigsecret'});
        expect(response.status).toEqual(401);
        const wwwAuthHeader = response.get('WWW-Authenticate') || '';
        expect(wwwAuthHeader).toEqual(expect.stringContaining('Bearer'));
    });
    it('POST api/token with unknown parameters should return 400', async () => {
        const response = await request(server)
            .post('/api/token')
            .send({foo: 'bar'});
        expect(response.status).toEqual(400);
    });
    it('POST api/token with valid credentials should return token info, set cookie jb-rt (refresh token)', async () => {
        const response = await request(server)
            .post('/api/token')
            .send({username: readerUser.username, password: readerUser.password});
        expect(response.status).toEqual(200);
        expect(response.body.message).toEqual('OK');
        expect(response.body).toHaveProperty('token');
        expect(response.header['set-cookie'][0]).toContain('jb-rt=');
        expect(response.header['set-cookie'][0]).toContain('httponly');
    });
});

describe('api/token/refresh', () => {
    it('GET should return 404', async () => {
        const response = await request(server)
            .get('/api/token/refresh');
        expect(response.status).toEqual(404);
    });

    it('POST without refresh token cookie should return 401, set www-authenticate header', async () => {
        const response = await request(server)
            .post('/api/token/refresh');
        expect(response.status).toEqual(401);
        const wwwAuthHeader = response.get('WWW-Authenticate') || '';
        expect(wwwAuthHeader).toEqual(expect.stringContaining('Bearer'));
    });

    it('POST without refresh token cookie should return 401, set www-authenticate header', async () => {
        const response = await request(server)
            .post('/api/token/refresh');
        expect(response.status).toEqual(401);
        const wwwAuthHeader = response.get('WWW-Authenticate') || '';
        expect(wwwAuthHeader).toEqual(expect.stringContaining('Bearer'));
    });

    it('POST with invalid refresh token cookie should return 401, set www-authenticate header', async () => {
        const response = await request(server)
            .post('/api/token/refresh')
            .set('Cookie', ['jb-rt=INVALID_TOKEN']);
        expect(response.status).toEqual(401);
        const wwwAuthHeader = response.get('WWW-Authenticate') || '';
        expect(wwwAuthHeader).toEqual(expect.stringContaining('Bearer'));
    });

    it('POST with valid refresh token cookie should return 200, response.token', async () => {
        // first, get valid refresh token
        const tokenResponse = await request(server)
            .post('/api/token')
            .send({username: readerUser.username, password: readerUser.password});

        const validTokenHeader = tokenResponse.header['set-cookie'][0] || '';
        const parsed = cookie.parse(validTokenHeader);
        const validToken = parsed['jb-rt'];
        const accessToken = tokenResponse.body.token;

        const response = await request(server)
            .post('/api/token/refresh')
            .set('Cookie', [`jb-rt=${validToken}`])
            .set('Authorization', `Bearer ${accessToken}`);
        expect(response.status).toEqual(200);
        expect(response.body).toHaveProperty('token');
    })
});

describe('api/echo', () => {
    it('GET should return any string', async () => {
        const response = await request(server).get('/api/echo');
        expect(response.status).toEqual(200);
        expect(response.text).toEqual(expect.stringContaining('Service up'));
    });

    it('POST should return 404', async () => {
        const response = await request(server).post('/api/echo');
        expect(response.status).toEqual(404);
    });

    it('GET with valid Auth header should return authenticated user info', async () => {
        // first get valid token
        const responseToken = await request(server)
            .post('/api/token')
            .send({username: readerUser.username, password: readerUser.password});
        const accessToken = responseToken.body.token;

        // and now send request with access token
        const response = await request(server)
            .get('/api/echo')
            .set('Authorization', `Bearer ${accessToken}`);
        expect(response.status).toEqual(200);
        expect(response.text).toEqual(expect.stringContaining('username'));
    });

    it('GET with invalid Auth header should not return user info, status 400', async () => {
        const response = await request(server)
            .get('/api/echo')
            .set('Authorization', `Bearer INVALID_TOKEN`);
        expect(response.status).toEqual(400);
        expect(response.text).toEqual(expect.not.stringContaining('username'));
    })
});

describe('api/user', () => {

    beforeAll(async () => {
        await UserModel.deleteMany({
            $or: [
                {username: 'addeduser'},
                {username: 'removeduser'}
            ]
        }).exec();
    });

    afterAll(async () => {
        await UserModel.deleteMany({
            $or: [
                {username: 'addeduser'},
                {username: 'removeduser'}
            ]
        }).exec();
    });

    it('POST without auth shoulkd produce status 403', async () => {
        const response = await request(server)
            .post('/api/user')
            .send({username: 'addeduser', password: 'secret', role: 'reader'});
        expect(response.status).toEqual(403);
    });

    it('POST with invalid parameters should produce status 400', async () => {
        let response = await request(server)
            .post('/api/user')
            .send({username: null, password: 'secret', role: 'reader'});
        expect(response.status).toEqual(400);

        response = await request(server)
            .post('/api/user')
            .send({username: 'addeduser', password: 'secret', role: 'reader', unexpectedProperty: null});
        expect(response.status).toEqual(400);

        response = await request(server)
            .post('/api/user');
        expect(response.status).toEqual(400);
    });

    it('POST with non admin auth should produce status 401', async () => {
        const responseToken = await request(server)
            .post('/api/token')
            .send({username: readerUser.username, password: readerUser.password});
        const accessToken = responseToken.body.token;

        const response = await request(server)
            .post('/api/user')
            .set('Authorization', `Bearer ${accessToken}`)
            .send({username: 'addeduser', password: 'secret', role: 'reader'});
        expect(response.status).toEqual(401);
    });

    it('POST with admin auth should produce status 200 and new user must be able to get assess token', async () => {
        const adminResponseToken = await request(server)
            .post('/api/token')
            .send({username: adminUser.username, password: adminUser.password});
        const adminAccessToken = adminResponseToken.body.token;

        const response = await request(server)
            .post('/api/user')
            .set('Authorization', `Bearer ${adminAccessToken}`)
            .send({username: 'addeduser', password: 'secret', role: 'reader'});
        expect(response.status).toEqual(200);

        const userResponseToken = await request(server)
            .post('/api/token')
            .send({username: 'addeduser', password: 'secret'});
        expect(userResponseToken.status).toEqual(200);
        const userAccessToken = userResponseToken.body.token;
        expect(userResponseToken.body).toHaveProperty('token');
    });

    it('DELETE without auth should produce status 403', async () => {
        const response = await request(server)
            .delete('/api/user')
            .send({username: 'removed'});
        expect(response.status).toEqual(403);
    });

    it('DELETE without admin rights should produce status 401', async () => {
        const responseToken = await request(server)
            .post('/api/token')
            .send({username: readerUser.username, password: readerUser.password});
        const accessToken = responseToken.body.token;

        const response = await request(server)
            .delete('/api/user')
            .set('Authorization', `Bearer ${accessToken}`)
            .send({username: 'removeduser'});
        expect(response.status).toEqual(401);
    });

    it('DELETE with admin rights should produce status 204', async () => {
        const responseAdminToken = await request(server)
            .post('/api/token')
            .send({username: adminUser.username, password: adminUser.password});
        const adminAccessToken = responseAdminToken.body.token;

        const response = await request(server)
            .delete('/api/user')
            .set('Authorization', `Bearer ${adminAccessToken}`)
            .send({username: 'removeduser'});
        expect(response.status).toEqual(204);
    });
});

describe('api/user/list', () => {
    it('GET with admin auth should produce user list and status 200', async () => {
        const responseAdminToken = await request(server)
            .post('/api/token')
            .send({username: adminUser.username, password: adminUser.password});
        const adminAccessToken = responseAdminToken.body.token;

        const response = await request(server)
            .get('/api/user/list')
            .set('Authorization', `Bearer ${adminAccessToken}`)
            .query({username: 'adm'});
        expect(response.status).toEqual(200);
    });
});

describe('api/user/changerole', () => {
    it('POST with invalid paramater should produce status 400', async () => {
        const response = await request(server)
            .post('/api/user/changerole')
            .send({
                username: 'notexistent',
                invalidOptions: 'foo'
            });
        expect(response.status).toEqual(400);
    });

    it('POST without authentication should produce status 403', async () => {
        const response = await request(server)
            .post('/api/user/changerole')
            .send({
                username: 'bla',
                role: 'foo',
            });
        expect(response.status).toEqual(403);
    });

    it('POST without admin rights should produce status 401', async () => {
        const readerTokenRespone = await request(server)
            .post('/api/token')
            .send({username: readerUser.username, password: readerUser.password});
        const accessToken = readerTokenRespone.body.token;

        const response = await request(server)
            .post('/api/user/changerole')
            .set('Authorization', `Bearer ${accessToken}`)
            .send({
                username: readerUser.username,
                role: 'admin'
            });
        expect(response.status).toEqual(401);
    });

    it('POST with admin rights should produce status 201', async () => {
        const adminTokenRespone = await request(server)
            .post('/api/token')
            .send({username: adminUser.username, password: adminUser.password});
        const accessToken = adminTokenRespone.body.token;

        const response = await request(server)
            .post('/api/user/changerole')
            .set('Authorization', `Bearer ${accessToken}`)
            .send({
                username: readerUser.username,
                role: 'admin'
            });

        const checkRespone = await request(server)
            .get('/api/user/list')
            .set('Authorization', `Bearer ${accessToken}`)
            .query({username: readerUser.username});
        expect(checkRespone.body.items[0].role).toEqual('admin');

        // and restore role
        await request(server)
            .post('/api/user/changerole')
            .set('Authorization', `Bearer ${accessToken}`)
            .send({
                username: readerUser.username,
                role: 'reader'
            });
    });
});

describe('api/fs', () => {
    it('GET without authentication should produce state 403', async () => {
        const response = await request(server)
            .get('/api/fs');

        expect(response.status).toEqual(403);
    });

    it('GET without admin rights should produce status 401', async () => {
        const responseReaderToken = await request(server)
            .post('/api/token')
            .send({username: readerUser.username, password: readerUser.password});
        const accessToken = responseReaderToken.body.token;

        const response = await request(server)
            .get('/api/fs')
            .set('Authorization', `Bearer ${accessToken}`);

        expect(response.status).toEqual(401);
    });

    it('GET with admin rights and invalid parameters should produce status 400', async () => {
        const responseAdminToken = await request(server)
            .post('/api/token')
            .send({username: adminUser.username, password: adminUser.password});
        const accessToken = responseAdminToken.body.token;

        let response = await request(server)
            .get('/api/fs')
            .query({badParameter: 'foo'})
            .set('Authorization', `Bearer ${accessToken}`);
        expect(response.status).toEqual(400);

        response = await request(server)
            .get('/api/fs')
            .query({dateTo: 'bad-date'})
            .set('Authorization', `Bearer ${accessToken}`);
        expect(response.status).toEqual(400);

        response = await request(server)
            .get('/api/fs')
            .query({page: '-1'})
            .set('Authorization', `Bearer ${accessToken}`);
        expect(response.status).toEqual(400);
    });

    it('GET with admin rights and valid parameters should produce status 200', async () => {
        const responseAdminToken = await request(server)
            .post('/api/token')
            .send({username: adminUser.username, password: adminUser.password});
        const accessToken = responseAdminToken.body.token;

        let response = await request(server)
            .get('/api/fs')
            .query({dateTo: '12/01/2019'})
            .set('Authorization', `Bearer ${accessToken}`);
        expect(response.status).toEqual(200);

        response = await request(server)
            .get('/api/fs')
            .query({dateTo: '12-01-2019'})
            .set('Authorization', `Bearer ${accessToken}`);
        expect(response.status).toEqual(200);

        response = await request(server)
            .get('/api/fs')
            .query({page: '1'})
            .set('Authorization', `Bearer ${accessToken}`);
        expect(response.status).toEqual(200);
    });
});

describe('api/user/changepassword', () => {
    it('GET should produce status 404', async () => {
        const response = await request(server)
            .get('/api/user/changepassword');

        expect(response.status).toEqual(404);
    });

    it('POST with invalid paramater should produce status 400', async () => {
        const response = await request(server)
            .post('/api/user/changepassword')
            .send({
                invalidOptions: 'foo'
            });
        expect(response.status).toEqual(400);
    });

    it('POST without authentication should produce status 403', async () => {
        const response = await request(server)
            .post('/api/user/changepassword')
            .send({
                newPassword: 'foo',
                password: 'bar',
                username: 'bla'
            });
        expect(response.status).toEqual(403);
    });

    it('POST with authentication and wrong params should produce status 403', async () => {
        const responseToken = await request(server)
            .post('/api/token')
            .send({username: readerUser.username, password: readerUser.password});
        const accessToken = responseToken.body.token;

        const response = await request(server)
            .post('/api/user/changepassword')
            .set('Authorization', `Bearer ${accessToken}`)
            .send({
                newPassword: 'bar',
                password: 'this is wrong pass',
                username: readerUser.username,
            });
        expect(response.status).toEqual(403);
    });

    it('POST with authentication and valid params should produce status 201', async () => {
        const responseToken = await request(server)
            .post('/api/token')
            .send({username: readerUser.username, password: readerUser.password});
        const accessToken = responseToken.body.token;

        const response = await request(server)
            .post('/api/user/changepassword')
            .set('Authorization', `Bearer ${accessToken}`)
            .send({
                newPassword: readerUser.password,
                password: readerUser.password,
                username: readerUser.username
            });
        expect(response.status).toEqual(201);
    });

    it('POST with authentication and valid params should change password', async () => {
        let responseToken = await request(server)
            .post('/api/token')
            .send({username: readerUser.username, password: readerUser.password});
        let accessToken = responseToken.body.token;

        let response = await request(server)
            .post('/api/user/changepassword')
            .set('Authorization', `Bearer ${accessToken}`)
            .send({
                newPassword: 'newpass',
                password: readerUser.password,
                username: readerUser.username,
            });
        expect(response.status).toEqual(201);

        // try get token with new credentials
        responseToken = await request(server)
            .post('/api/token')
            .send({username: readerUser.username, password: 'newpass'});
        expect(responseToken.status).toEqual(200);
        accessToken = responseToken.body.token;

        // change password back
        response = await request(server)
            .post('/api/user/changepassword')
            .set('Authorization', `Bearer ${accessToken}`)
            .send({
                newPassword: readerUser.password,
                password: 'newpass',
                username: readerUser.username,
            });
        expect(response.status).toEqual(201);
    });
});


