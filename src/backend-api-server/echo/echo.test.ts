import 'reflect-metadata';
import {Server} from "http";
import {TestUtils} from "../test/utils";
import {routesMap} from "./echo-routes-map";
import request from "supertest";
import {container} from "../ioc/container";
import {runServer} from "../server-up";

let server: Server;
const {
    addTestUsers,
    clearTestUsers,
    tearDownHttpAndMongoose,
    apiRootPath,
    readerUser,
} = new TestUtils(container);

beforeAll(async () => {
    try {
        server = await runServer(container);
    } catch (err) {
        console.log('Could not start http server: ', err);
    }
    await addTestUsers();
});

afterAll(async () => {
    await clearTestUsers();
    await tearDownHttpAndMongoose(server);
});

describe(`${apiRootPath}${routesMap.echo}`, () => {
    it('GET should return any string', async () => {
        const response = await request(server).get(`${apiRootPath}${routesMap.echo}`);
        expect(response.status).toEqual(200);
        expect(response.text).toEqual(expect.stringContaining('Service up'));
    });

    it('POST should return 404', async () => {
        const response = await request(server).post(`${apiRootPath}${routesMap.echo}`);
        expect(response.status).toEqual(404);
    });

    it('GET with valid Auth header should return authenticated user info', async () => {
        // first get valid token
        const responseToken = await request(server)
            .post(`${apiRootPath}/token`)
            .send({username: readerUser.username, password: readerUser.password});
        const accessToken = responseToken.body.token;

        // and now send request with access token
        const response = await request(server)
            .get(`${apiRootPath}${routesMap.echo}`)
            .set('Authorization', `Bearer ${accessToken}`);
        expect(response.status).toEqual(200);
        expect(response.text).toEqual(expect.stringContaining('username'));
    });

    it('GET with invalid Auth header should not return user info, status 400', async () => {
        const response = await request(server)
            .get(`${apiRootPath}${routesMap.echo}`)
            .set('Authorization', `Bearer INVALID_TOKEN`);
        expect(response.status).toEqual(400);
        expect(response.text).toEqual(expect.not.stringContaining('username'));
    })
});
