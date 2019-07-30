import {Server} from "http";
import {promiseForAppRun} from "../server";
import {addTestUsers, apiRootPath, clearTestUsers, tearDownHttpAndMongoose, adminUser, readerUser} from "./utils";

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

describe('server.ts', () => {
    it('Server up', () => {
        expect(server).toBeInstanceOf(Server);
    });
});


