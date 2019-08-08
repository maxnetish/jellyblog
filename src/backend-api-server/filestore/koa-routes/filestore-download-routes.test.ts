import {Server} from "http";
import {promiseForAppRun} from "../../server";
import {
    addTestUsers,
    adminUser,
    apiRootPath,
    clearTestUsers, fsRootPath,
    readerUser,
    tearDownHttpAndMongoose
} from "../../test/utils";
import request from "supertest";

let server: Server;

beforeAll(async () => {
    try {
        server = await promiseForAppRun;
    } catch (err) {
        console.log('Could not start http server: ', err);
    }
    // await addTestUsers();
});

afterAll(async () => {
    // await clearTestUsers();
    await tearDownHttpAndMongoose(server);
});

describe(`${fsRootPath} routes`, () => {
    it('GET existing file', async () => {
        const response = await request(server)
            .get(`${fsRootPath}/2c096d610ea47430e738238be7135f05`);
        debugger;
        expect(response.status).toEqual(200);
    });
});
