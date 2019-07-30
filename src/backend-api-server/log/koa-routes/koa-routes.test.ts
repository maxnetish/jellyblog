import {Server} from "http";
import {promiseForAppRun} from "../../server";
import {
    addTestUsers,
    adminUser, apiRootPath,
    clearTestUsers,
    readerUser,
    tearDownHttpAndMongoose,
} from "../../test/utils";
import {routesMap} from './koa-routes-map';
import request from 'supertest';
import {routesMap as tokenRoutesMap} from "../../token/koa-routes/token-routes-map";

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

describe(`${apiRootPath}${routesMap.prefix}${routesMap["log-get"]}`, () => {

    it(`GET without aut should produce status 403`, async () => {
        const response = await request(server)
            .get(`${apiRootPath}${routesMap.prefix}${routesMap["log-get"]}`);
        expect(response.status).toEqual(403);
    });

    it(`GET without admin rights should produce status 401`, async () => {
        const readerResponseToken = await request(server)
            .post(`${apiRootPath}${tokenRoutesMap.prefix}${tokenRoutesMap["token-get"]}`)
            .send({username: readerUser.username, password: readerUser.password});
        const readerAccessToken = readerResponseToken.body.token;

        const response = await request(server)
            .get(`${apiRootPath}${routesMap.prefix}${routesMap["log-get"]}`)
            .set('Authorization', `Bearer ${readerAccessToken}`);
        expect(response.status).toEqual(401);
    });

    it(`GET with invalid criteria should produce status 400`, async () => {
        const adminResponseToken = await request(server)
            .post(`${apiRootPath}${tokenRoutesMap.prefix}${tokenRoutesMap["token-get"]}`)
            .send({username: adminUser.username, password: adminUser.password});
        const adminAccessToken = adminResponseToken.body.token;

        let response = await request(server)
            .get(`${apiRootPath}${routesMap.prefix}${routesMap["log-get"]}`)
            .query({
                error: 'invalid boolean value'
            })
            .set('Authorization', `Bearer ${adminAccessToken}`);
        expect(response.status).toEqual(400);

        response = await request(server)
            .get(`${apiRootPath}${routesMap.prefix}${routesMap["log-get"]}`)
            .query({
                unexpected: 'foo'
            })
            .set('Authorization', `Bearer ${adminAccessToken}`);
        expect(response.status).toEqual(400);
    });

    it(`GET with valid criteria should produce status 200 and pagination response`, async () => {
        const adminResponseToken = await request(server)
            .post(`${apiRootPath}${tokenRoutesMap.prefix}${tokenRoutesMap["token-get"]}`)
            .send({username: adminUser.username, password: adminUser.password});
        const adminAccessToken = adminResponseToken.body.token;

        let response = await request(server)
            .get(`${apiRootPath}${routesMap.prefix}${routesMap["log-get"]}`)
            .set('Authorization', `Bearer ${adminAccessToken}`);
        expect(response.status).toEqual(200);
        expect(response.body).toHaveProperty('items');
        expect(response.body).toHaveProperty('page');

        response = await request(server)
            .get(`${apiRootPath}${routesMap.prefix}${routesMap["log-get"]}`)
            .query({
                err: 'true',
                dateTo: '12/10/2019',
                dateFrom: '01-01-1969',
            })
            .set('Authorization', `Bearer ${adminAccessToken}`);
        expect(response.status).toEqual(200);
        expect(response.body).toHaveProperty('items');
        expect(response.body).toHaveProperty('page');
    });
});
