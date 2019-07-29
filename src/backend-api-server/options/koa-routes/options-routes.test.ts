import {Server} from "http";
import {routesMap} from "./options-routes-map";
import {routesMap as tokenRoutesMap} from "../../token/koa-routes/token-routes-map";
import {promiseForAppRun} from "../../server";
import {
    tearDownHttpAndMongoose,
    textToHash,
    adminUser,
    readerUser,
    addTestUsers,
    clearTestUsers
} from "../../test/utils";
import request from 'supertest';

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

describe(`Routes api${routesMap.prefix}`, () => {

    it(`GET api${routesMap.prefix}${routesMap["robots-txt-content"]} should produce status 200 and return content`, async () => {
        const response = await request(server)
            .get(`/api${routesMap.prefix}${routesMap["robots-txt-content"]}`);
        expect(response.status).toEqual(200);
        expect(response.body).toHaveProperty('content');
    });

    it(`GET api${routesMap.prefix}${routesMap["robots-txt"]} without auth should produce status 403`, async () => {
        const response = await request(server)
            .get(`/api${routesMap.prefix}${routesMap["robots-txt"]}`);
        expect(response.status).toEqual(403);
    });

    it(`GET api${routesMap.prefix}${routesMap["robots-txt"]} without admin rights should produce status 401`, async () => {
        const readerResponseToken = await request(server)
            .post(`/api${tokenRoutesMap.prefix}${tokenRoutesMap["token-get"]}`)
            .send({username: readerUser.username, password: readerUser.password});
        const readerAccessToken = readerResponseToken.body.token;

        const response = await request(server)
            .get(`/api${routesMap.prefix}${routesMap["robots-txt"]}`)
            .set('Authorization', `Bearer ${readerAccessToken}`);
        expect(response.status).toEqual(401);
    });

    it(`GET api${routesMap.prefix}${routesMap["robots-txt"]} with admin rights should produce status 200 and return IOptionsRobotsTxt`, async () => {
        const readerResponseToken = await request(server)
            .post(`/api${tokenRoutesMap.prefix}${tokenRoutesMap["token-get"]}`)
            .send({username: adminUser.username, password: adminUser.password});
        const readerAccessToken = readerResponseToken.body.token;

        const response = await request(server)
            .get(`/api${routesMap.prefix}${routesMap["robots-txt"]}`)
            .set('Authorization', `Bearer ${readerAccessToken}`);
        expect(response.status).toEqual(200);
        expect(response.body).toHaveProperty('content');
        expect(response.body).toHaveProperty('allowRobots');
    });
});

