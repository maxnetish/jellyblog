import 'reflect-metadata';
import {Server} from "http";
import {TestUtils} from "../../../test/utils";
import request from "supertest";
import {container as rootContainer} from "../../../ioc/container";
import {existingFileName, FileServiceMock, unexistingFileName} from "./file-service.mock";
import {runServer} from "../../../server-up";
import {TYPES} from "../../../ioc/types";

let server: Server;
// inject mock
rootContainer.rebind(TYPES.FileService).to(FileServiceMock);
const {
    fsRootPath,
    tearDownHttpAndMongoose,
} = new TestUtils(rootContainer);

beforeAll(async () => {
    try {
        server = await runServer(rootContainer);
    } catch (err) {
        console.log('Could not start http server: ', err);
    }
    // await addTestUsers();
});

afterAll(async () => {
    // await clearTestUsers();

    // add 2,5 sec to allow server send streams...
    return new Promise((resolve, reject) => {
        setTimeout(async () => {
            await tearDownHttpAndMongoose(server);
            resolve();
        }, 2500);
    });
});

describe(`${fsRootPath} routes - download`, () => {
    it('GET existing file', async () => {
        const response = await request(server)
            .get(`${fsRootPath}/${existingFileName}`);
        expect(response.status).toEqual(200);
        expect(response.header['content-length']).toBe(response.body.length.toString());
    });
    it('GET unexisting file should produce 404', async () => {
        const response = await request(server)
            .get(`${fsRootPath}/${unexistingFileName}`);
        expect(response.status).toEqual(404);
    });
});
