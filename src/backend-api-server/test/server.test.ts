import 'reflect-metadata';
import {Server} from "http";
import {TestUtils} from "./utils";
import {container} from "../ioc/container";
import {runServer} from "../server-up";

let server: Server;
const {
    addTestUsers,
    clearTestUsers,
    tearDownHttpAndMongoose,
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

describe('server.ts', () => {
    it('Server up', () => {
        expect(server).toBeInstanceOf(Server);
    });
});


