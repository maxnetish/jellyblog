import {Server} from "http";
import promiseForAppRun from "../server";
import {tearDownHttpAndMongoose} from "./utils";
import request from 'supertest';

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
    it('POST api/token should return 401', async () => {
        const response = await request(server)
            .post('/api/token')
            .send({username: 'foo', password: 'bigsecret'});
        expect(response.status).toEqual(401);
    });
    it('POST api/token should return 401', async () => {
        const response = await request(server)
            .post('/api/token')
            .send({username: 'not-existent', password: 'bigsecret'});
        expect(response.status).toEqual(401);
    });
    it('POST api/token should return 400', async () => {
        const response = await request(server)
            .post('/api/token')
            .send({foo: 'bar'});
        expect(response.status).toEqual(400);
    });
    it('POST api/token should return token info', async () => {
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

describe('api/echo', () => {
    it('GET should return any string', async () => {
        const response = await request(server).get('/api/echo');
        expect(response.status).toEqual(200);
        expect(response.text).toEqual('Service up');
    });

    it('POST api/echo should return 404', async () => {
        const response = await request(server).post('/api/echo');
        expect(response.status).toEqual(404);
    });
});


