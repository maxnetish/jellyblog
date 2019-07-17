import {Server} from "http";
import promiseForAppRun from "../server";
import {tearDownHttpAndMongoose} from "./utils";
import request from 'supertest';
import cookie from 'cookie';

let server: Server;

beforeAll(async () => {
    server = await promiseForAppRun;
});

afterAll(async () => {
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
            .send({username: 'foo', password: 'bigsecret'});
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
            .send({username: 'foo', password: 'bar'});
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
            .send({username: 'foo', password: 'bar'});

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
            .send({username: 'foo', password: 'bar'});
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
            .send({username: 'foo', password: 'bar'});
        const accessToken = responseToken.body.token;

        const response = await request(server)
            .post('/api/user/changepassword')
            .set('Authorization', `Bearer ${accessToken}`)
            .send({
                newPassword: 'bar',
                password: 'this is wrong pass',
                username: 'foo'
            });
        expect(response.status).toEqual(403);
    });

    it('POST with authentication and valid params should produce status 201', async () => {
        const responseToken = await request(server)
            .post('/api/token')
            .send({username: 'foo', password: 'bar'});
        const accessToken = responseToken.body.token;

        const response = await request(server)
            .post('/api/user/changepassword')
            .set('Authorization', `Bearer ${accessToken}`)
            .send({
                newPassword: 'bar',
                password: 'bar',
                username: 'foo'
            });
        expect(response.status).toEqual(201);
    });

    it('POST with authentication and valid params should change password', async () => {
        let responseToken = await request(server)
            .post('/api/token')
            .send({username: 'foo', password: 'bar'});
        let accessToken = responseToken.body.token;

        let response = await request(server)
            .post('/api/user/changepassword')
            .set('Authorization', `Bearer ${accessToken}`)
            .send({
                newPassword: 'newpass',
                password: 'bar',
                username: 'foo'
            });
        expect(response.status).toEqual(201);

        // try get token with new credentials
        responseToken = await request(server)
            .post('/api/token')
            .send({username: 'foo', password: 'newpass'});
        expect(responseToken.status).toEqual(200);
        accessToken = responseToken.body.token;

        // change password back
        response = await request(server)
            .post('/api/user/changepassword')
            .set('Authorization', `Bearer ${accessToken}`)
            .send({
                newPassword: 'bar',
                password: 'newpass',
                username: 'foo'
            });
        expect(response.status).toEqual(201);
    });
});


