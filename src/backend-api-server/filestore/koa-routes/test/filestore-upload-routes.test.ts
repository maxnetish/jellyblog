import 'reflect-metadata';
import {Server} from "http";
import {TestUtils} from "../../../test/utils";
import request from "supertest";
import {container as rootContainer} from "../../../ioc/container";
import {runServer} from "../../../server-up";

let server: Server;
const {
    addTestUsers,
    clearTestUsers,
    adminUser,
    fsRootPath,
    tearDownHttpAndMongoose,
} = new TestUtils(rootContainer);

beforeAll(async () => {
    try {
        server = await runServer(rootContainer);
    } catch (err) {
        console.log('Could not start http server: ', err);
    }
    await addTestUsers();
});

afterAll(async () => {
    await clearTestUsers();

    // add 2,5 sec to allow server send streams...
    return new Promise((resolve, reject) => {
        setTimeout(async () => {
            await tearDownHttpAndMongoose(server);
            resolve();
        }, 2500);
    });
});

describe(`${fsRootPath} routes - upload`, () => {
    it('POST multipart data', async () => {
        // const response = await request(server)
        // expect(response.status).toEqual(200);
        // expect(response.header['content-length']).toBe(response.body.length.toString());
    });
});
