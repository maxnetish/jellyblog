import {promiseForAppRun} from "../../server";
import {addTestUsers, apiRootPath, clearTestUsers, readerUser, tearDownHttpAndMongoose} from "../../test/utils";
import {Server} from "http";
import request from "supertest";
import cookie from "cookie";
import {routesMap} from "./token-routes-map";

let server: Server;

beforeAll(async () => {
    try {
        server = await promiseForAppRun;
    } catch (err) {
        debugger;
        console.log('Could not start http server: ', err);
    }
    await addTestUsers();
});

afterAll(async () => {
    await clearTestUsers();
    await tearDownHttpAndMongoose(server);
});

describe(`${apiRootPath}${routesMap.prefix} routes`, () => {
    describe(`${apiRootPath}${routesMap.prefix}`, () => {
        it(`GET ${apiRootPath}${routesMap.prefix} should return 404`, async () => {
            const response = await request(server).get(`${apiRootPath}${routesMap.prefix}`);
            expect(response.status).toEqual(404);
        });
        it('POST api/token with invalid password should return 401, set WWW-authenticate header', async () => {
            const response = await request(server)
                .post(`${apiRootPath}${routesMap.prefix}`)
                .send({username: readerUser.username, password: 'wrong_pass'});
            expect(response.status).toEqual(401);
            const wwwAuthHeader = response.get('WWW-Authenticate') || '';
            expect(wwwAuthHeader).toEqual(expect.stringContaining('Bearer'));

        });
        it(`POST ${apiRootPath}${routesMap.prefix} with invalid username should return 401, set WWW-authenticate header`, async () => {
            const response = await request(server)
                .post(`${apiRootPath}${routesMap.prefix}`)
                .send({username: 'not-existent', password: 'bigsecret'});
            expect(response.status).toEqual(401);
            const wwwAuthHeader = response.get('WWW-Authenticate') || '';
            expect(wwwAuthHeader).toEqual(expect.stringContaining('Bearer'));
        });
        it(`POST ${apiRootPath}${routesMap.prefix} with unknown parameters should return 400`, async () => {
            const response = await request(server)
                .post(`${apiRootPath}${routesMap.prefix}`)
                .send({foo: 'bar'});
            expect(response.status).toEqual(400);
        });
        it(`POST ${apiRootPath}${routesMap.prefix} with valid credentials should return token info, set cookie jb-rt (refresh token)`, async () => {
            const response = await request(server)
                .post(`${apiRootPath}${routesMap.prefix}`)
                .send({username: readerUser.username, password: readerUser.password});
            expect(response.status).toEqual(200);
            expect(response.body.message).toEqual('OK');
            expect(response.body).toHaveProperty('token');
            expect(response.header['set-cookie'][0]).toContain('jb-rt=');
            expect(response.header['set-cookie'][0]).toContain('httponly');
        });
    });
    describe(`${apiRootPath}${routesMap.prefix}${routesMap["token-refresh"]}`, () => {
        it('GET should return 404', async () => {
            const response = await request(server)
                .get(`${apiRootPath}${routesMap.prefix}${routesMap["token-refresh"]}`);
            expect(response.status).toEqual(404);
        });

        it('POST without refresh token cookie should return 401, set www-authenticate header', async () => {
            const response = await request(server)
                .post(`${apiRootPath}${routesMap.prefix}${routesMap["token-refresh"]}`);
            expect(response.status).toEqual(401);
            const wwwAuthHeader = response.get('WWW-Authenticate') || '';
            expect(wwwAuthHeader).toEqual(expect.stringContaining('Bearer'));
        });

        it('POST without refresh token cookie should return 401, set www-authenticate header', async () => {
            const response = await request(server)
                .post(`${apiRootPath}${routesMap.prefix}${routesMap["token-refresh"]}`);
            expect(response.status).toEqual(401);
            const wwwAuthHeader = response.get('WWW-Authenticate') || '';
            expect(wwwAuthHeader).toEqual(expect.stringContaining('Bearer'));
        });

        it('POST with invalid refresh token cookie should return 401, set www-authenticate header', async () => {
            const response = await request(server)
                .post(`${apiRootPath}${routesMap.prefix}${routesMap["token-refresh"]}`)
                .set('Cookie', ['jb-rt=INVALID_TOKEN']);
            expect(response.status).toEqual(401);
            const wwwAuthHeader = response.get('WWW-Authenticate') || '';
            expect(wwwAuthHeader).toEqual(expect.stringContaining('Bearer'));
        });

        it('POST with valid refresh token cookie should return 200, response.token', async () => {
            // first, get valid refresh token
            const tokenResponse = await request(server)
                .post(`${apiRootPath}${routesMap.prefix}`)
                .send({username: readerUser.username, password: readerUser.password});

            const validTokenHeader = tokenResponse.header['set-cookie'][0] || '';
            const parsed = cookie.parse(validTokenHeader);
            const validToken = parsed['jb-rt'];
            const accessToken = tokenResponse.body.token;

            const response = await request(server)
                .post(`${apiRootPath}${routesMap.prefix}${routesMap["token-refresh"]}`)
                .set('Cookie', [`jb-rt=${validToken}`])
                .set('Authorization', `Bearer ${accessToken}`);
            expect(response.status).toEqual(200);
            expect(response.body).toHaveProperty('token');
        })
    });
});
