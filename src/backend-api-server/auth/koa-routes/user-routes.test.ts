import 'reflect-metadata';
import {Server} from "http";
import {TestUtils} from "../../test/utils";
import {routesMap} from "./user-routes-map";
import {container} from "../../ioc/container";
import {Model} from "mongoose";
import {IUserDocument} from "../api/user-document";
import {TYPES} from "../../ioc/types";
import request from "supertest";
import {routesMap as tokenRoutesMap} from "../../token/koa-routes/token-routes-map";
import {runServer} from "../../server-up";

let server: Server;
const {
    addTestUsers,
    clearTestUsers,
    tearDownHttpAndMongoose,
    apiRootPath,
    readerUser,
    adminUser
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

describe(`${apiRootPath}${routesMap.prefix} routes`, () => {
    describe(`${apiRootPath}${routesMap.prefix}`, () => {

        beforeAll(async () => {
            const UserModel = container.get<Model<IUserDocument>>(TYPES.ModelUser);
            await UserModel.deleteMany({
                $or: [
                    {username: 'addeduser'},
                    {username: 'removeduser'}
                ]
            }).exec();
        });

        afterAll(async () => {
            const UserModel = container.get<Model<IUserDocument>>(TYPES.ModelUser);
            await UserModel.deleteMany({
                $or: [
                    {username: 'addeduser'},
                    {username: 'removeduser'}
                ]
            }).exec();
        });

        it('POST without auth shoulkd produce status 403', async () => {
            const response = await request(server)
                .post(`${apiRootPath}${routesMap.prefix}`)
                .send({username: 'addeduser', password: 'secret', role: 'reader'});
            expect(response.status).toEqual(403);
        });

        it('POST with invalid parameters should produce status 400', async () => {
            let response = await request(server)
                .post(`${apiRootPath}${routesMap.prefix}`)
                .send({username: null, password: 'secret', role: 'reader'});
            expect(response.status).toEqual(400);

            response = await request(server)
                .post(`${apiRootPath}${routesMap.prefix}`)
                .send({username: 'addeduser', password: 'secret', role: 'reader', unexpectedProperty: null});
            expect(response.status).toEqual(400);

            response = await request(server)
                .post(`${apiRootPath}${routesMap.prefix}`);
            expect(response.status).toEqual(400);
        });

        it('POST with non admin auth should produce status 401', async () => {
            const responseToken = await request(server)
                .post(`${apiRootPath}${tokenRoutesMap.prefix}${tokenRoutesMap["token-get"]}`)
                .send({username: readerUser.username, password: readerUser.password});
            const accessToken = responseToken.body.token;

            const response = await request(server)
                .post(`${apiRootPath}${routesMap.prefix}`)
                .set('Authorization', `Bearer ${accessToken}`)
                .send({username: 'addeduser', password: 'secret', role: 'reader'});
            expect(response.status).toEqual(401);
        });

        it('POST with admin auth should produce status 200 and new user must be able to get assess token', async () => {
            const adminResponseToken = await request(server)
                .post(`${apiRootPath}${tokenRoutesMap.prefix}${tokenRoutesMap["token-get"]}`)
                .send({username: adminUser.username, password: adminUser.password});
            const adminAccessToken = adminResponseToken.body.token;

            const response = await request(server)
                .post(`${apiRootPath}${routesMap.prefix}`)
                .set('Authorization', `Bearer ${adminAccessToken}`)
                .send({username: 'addeduser', password: 'secret', role: 'reader'});
            expect(response.status).toEqual(200);

            const userResponseToken = await request(server)
                .post(`${apiRootPath}${tokenRoutesMap.prefix}${tokenRoutesMap["token-get"]}`)
                .send({username: 'addeduser', password: 'secret'});
            expect(userResponseToken.status).toEqual(200);
            const userAccessToken = userResponseToken.body.token;
            expect(userResponseToken.body).toHaveProperty('token');
        });

        it('DELETE without auth should produce status 403', async () => {
            const response = await request(server)
                .delete(`${apiRootPath}${routesMap.prefix}`)
                .send({username: 'removed'});
            expect(response.status).toEqual(403);
        });

        it('DELETE without admin rights should produce status 401', async () => {
            const responseToken = await request(server)
                .post(`${apiRootPath}${tokenRoutesMap.prefix}${tokenRoutesMap["token-get"]}`)
                .send({username: readerUser.username, password: readerUser.password});
            const accessToken = responseToken.body.token;

            const response = await request(server)
                .delete(`${apiRootPath}${routesMap.prefix}`)
                .set('Authorization', `Bearer ${accessToken}`)
                .send({username: 'removeduser'});
            expect(response.status).toEqual(401);
        });

        it('DELETE with admin rights should produce status 204', async () => {
            const responseAdminToken = await request(server)
                .post(`${apiRootPath}${tokenRoutesMap.prefix}${tokenRoutesMap["token-get"]}`)
                .send({username: adminUser.username, password: adminUser.password});
            const adminAccessToken = responseAdminToken.body.token;

            const response = await request(server)
                .delete(`${apiRootPath}${routesMap.prefix}`)
                .set('Authorization', `Bearer ${adminAccessToken}`)
                .send({username: 'removeduser'});
            expect(response.status).toEqual(204);
        });
    });

    describe(`${apiRootPath}${routesMap.prefix}${routesMap["users-find"]}`, () => {
        it('GET with admin auth should produce user list and status 200', async () => {
            const responseAdminToken = await request(server)
                .post(`${apiRootPath}${tokenRoutesMap.prefix}${tokenRoutesMap["token-get"]}`)
                .send({username: adminUser.username, password: adminUser.password});
            const adminAccessToken = responseAdminToken.body.token;

            const response = await request(server)
                .get(`${apiRootPath}${routesMap.prefix}${routesMap["users-find"]}`)
                .set('Authorization', `Bearer ${adminAccessToken}`)
                .query({username: 'adm'});
            expect(response.status).toEqual(200);
        });
    });

    describe(`${apiRootPath}${routesMap.prefix}${routesMap["user-change-role"]}`, () => {
        it('POST with invalid paramater should produce status 400', async () => {
            const response = await request(server)
                .post(`${apiRootPath}${routesMap.prefix}${routesMap["user-change-role"]}`)
                .send({
                    username: 'notexistent',
                    invalidOptions: 'foo'
                });
            expect(response.status).toEqual(400);
        });

        it('POST without authentication should produce status 403', async () => {
            const response = await request(server)
                .post(`${apiRootPath}${routesMap.prefix}${routesMap["user-change-role"]}`)
                .send({
                    username: 'bla',
                    role: 'foo',
                });
            expect(response.status).toEqual(403);
        });

        it('POST without admin rights should produce status 401', async () => {
            const readerTokenRespone = await request(server)
                .post(`${apiRootPath}${tokenRoutesMap.prefix}${tokenRoutesMap["token-get"]}`)
                .send({username: readerUser.username, password: readerUser.password});
            const accessToken = readerTokenRespone.body.token;

            const response = await request(server)
                .post(`${apiRootPath}${routesMap.prefix}${routesMap["user-change-role"]}`)
                .set('Authorization', `Bearer ${accessToken}`)
                .send({
                    username: readerUser.username,
                    role: 'admin'
                });
            expect(response.status).toEqual(401);
        });

        it('POST with admin rights should produce status 201', async () => {
            const adminTokenRespone = await request(server)
                .post(`${apiRootPath}${tokenRoutesMap.prefix}${tokenRoutesMap["token-get"]}`)
                .send({username: adminUser.username, password: adminUser.password});
            const accessToken = adminTokenRespone.body.token;

            const response = await request(server)
                .post(`${apiRootPath}${routesMap.prefix}${routesMap["user-change-role"]}`)
                .set('Authorization', `Bearer ${accessToken}`)
                .send({
                    username: readerUser.username,
                    role: 'admin'
                });

            const checkRespone = await request(server)
                .get(`${apiRootPath}${routesMap.prefix}${routesMap["users-find"]}`)
                .set('Authorization', `Bearer ${accessToken}`)
                .query({username: readerUser.username});
            expect(checkRespone.body.items[0].role).toEqual('admin');

            // and restore role
            await request(server)
                .post(`${apiRootPath}${routesMap.prefix}${routesMap["user-change-role"]}`)
                .set('Authorization', `Bearer ${accessToken}`)
                .send({
                    username: readerUser.username,
                    role: 'reader'
                });
        });
    });

    describe(`${apiRootPath}${routesMap.prefix}${routesMap["user-change-password"]}`, () => {
        it('GET should produce status 404', async () => {
            const response = await request(server)
                .get(`${apiRootPath}${routesMap.prefix}${routesMap["user-change-password"]}`);

            expect(response.status).toEqual(404);
        });

        it('POST with invalid paramater should produce status 400', async () => {
            const response = await request(server)
                .post(`${apiRootPath}${routesMap.prefix}${routesMap["user-change-password"]}`)
                .send({
                    invalidOptions: 'foo'
                });
            expect(response.status).toEqual(400);
        });

        it('POST without authentication should produce status 403', async () => {
            const response = await request(server)
                .post(`${apiRootPath}${routesMap.prefix}${routesMap["user-change-password"]}`)
                .send({
                    newPassword: 'foo',
                    password: 'bar',
                    username: 'bla'
                });
            expect(response.status).toEqual(403);
        });

        it('POST with authentication and wrong params should produce status 403', async () => {
            const responseToken = await request(server)
                .post(`${apiRootPath}${tokenRoutesMap.prefix}${tokenRoutesMap["token-get"]}`)
                .send({username: readerUser.username, password: readerUser.password});
            const accessToken = responseToken.body.token;

            const response = await request(server)
                .post(`${apiRootPath}${routesMap.prefix}${routesMap["user-change-password"]}`)
                .set('Authorization', `Bearer ${accessToken}`)
                .send({
                    newPassword: 'bar',
                    password: 'this is wrong pass',
                    username: readerUser.username,
                });
            expect(response.status).toEqual(403);
        });

        it('POST with authentication and valid params should produce status 201', async () => {
            const responseToken = await request(server)
                .post(`${apiRootPath}${tokenRoutesMap.prefix}${tokenRoutesMap["token-get"]}`)
                .send({username: readerUser.username, password: readerUser.password});
            const accessToken = responseToken.body.token;

            const response = await request(server)
                .post(`${apiRootPath}${routesMap.prefix}${routesMap["user-change-password"]}`)
                .set('Authorization', `Bearer ${accessToken}`)
                .send({
                    newPassword: readerUser.password,
                    password: readerUser.password,
                    username: readerUser.username
                });
            expect(response.status).toEqual(201);
        });

        it('POST with authentication and valid params should change password', async () => {
            let responseToken = await request(server)
                .post(`${apiRootPath}${tokenRoutesMap.prefix}${tokenRoutesMap["token-get"]}`)
                .send({username: readerUser.username, password: readerUser.password});
            let accessToken = responseToken.body.token;

            let response = await request(server)
                .post(`${apiRootPath}${routesMap.prefix}${routesMap["user-change-password"]}`)
                .set('Authorization', `Bearer ${accessToken}`)
                .send({
                    newPassword: 'newpass',
                    password: readerUser.password,
                    username: readerUser.username,
                });
            expect(response.status).toEqual(201);

            // try get token with new credentials
            responseToken = await request(server)
                .post(`${apiRootPath}${tokenRoutesMap.prefix}${tokenRoutesMap["token-get"]}`)
                .send({username: readerUser.username, password: 'newpass'});
            expect(responseToken.status).toEqual(200);
            accessToken = responseToken.body.token;

            // change password back
            response = await request(server)
                .post(`${apiRootPath}${routesMap.prefix}${routesMap["user-change-password"]}`)
                .set('Authorization', `Bearer ${accessToken}`)
                .send({
                    newPassword: readerUser.password,
                    password: 'newpass',
                    username: readerUser.username,
                });
            expect(response.status).toEqual(201);
        });
    });
});
