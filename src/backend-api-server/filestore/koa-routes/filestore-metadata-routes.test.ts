import {Server} from "http";
import {promiseForAppRun} from "../../server";
import {
    addTestUsers,
    adminUser,
    apiRootPath,
    clearTestUsers,
    readerUser,
    tearDownHttpAndMongoose
} from "../../test/utils";
import request from "supertest";
import {routesMap} from "./filestore-metadata-routes-map";
import {routesMap as tokenRoutesMap} from "../../token/koa-routes/token-routes-map";

let server: Server;

beforeAll(async () => {
    try {
        server = await promiseForAppRun;
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
    it('GET without authentication should produce state 403', async () => {
        const response = await request(server)
            .get(`${apiRootPath}${routesMap.prefix}`);

        expect(response.status).toEqual(403);
    });

    it('GET without admin rights should produce status 401', async () => {
        const responseReaderToken = await request(server)
            .post(`${apiRootPath}${tokenRoutesMap.prefix}${tokenRoutesMap["token-get"]}`)
            .send({username: readerUser.username, password: readerUser.password});
        const accessToken = responseReaderToken.body.token;

        const response = await request(server)
            .get(`${apiRootPath}${routesMap.prefix}`)
            .set('Authorization', `Bearer ${accessToken}`);

        expect(response.status).toEqual(401);
    });

    it('GET with admin rights and invalid parameters should produce status 400', async () => {
        const responseAdminToken = await request(server)
            .post(`${apiRootPath}${tokenRoutesMap.prefix}${tokenRoutesMap["token-get"]}`)
            .send({username: adminUser.username, password: adminUser.password});
        const accessToken = responseAdminToken.body.token;

        let response = await request(server)
            .get(`${apiRootPath}${routesMap.prefix}`)
            .query({badParameter: 'foo'})
            .set('Authorization', `Bearer ${accessToken}`);
        expect(response.status).toEqual(400);

        response = await request(server)
            .get(`${apiRootPath}${routesMap.prefix}`)
            .query({dateTo: 'bad-date'})
            .set('Authorization', `Bearer ${accessToken}`);
        expect(response.status).toEqual(400);

        response = await request(server)
            .get(`${apiRootPath}${routesMap.prefix}`)
            .query({page: '-1'})
            .set('Authorization', `Bearer ${accessToken}`);
        expect(response.status).toEqual(400);
    });

    it('GET with admin rights and valid parameters should produce status 200', async () => {
        const responseAdminToken = await request(server)
            .post(`${apiRootPath}${tokenRoutesMap.prefix}${tokenRoutesMap["token-get"]}`)
            .send({username: adminUser.username, password: adminUser.password});
        const accessToken = responseAdminToken.body.token;

        let response = await request(server)
            .get(`${apiRootPath}${routesMap.prefix}`)
            .query({dateTo: '12/01/2019'})
            .set('Authorization', `Bearer ${accessToken}`);
        expect(response.status).toEqual(200);

        response = await request(server)
            .get(`${apiRootPath}${routesMap.prefix}`)
            .query({dateTo: '12-01-2019'})
            .set('Authorization', `Bearer ${accessToken}`);
        expect(response.status).toEqual(200);

        response = await request(server)
            .get(`${apiRootPath}${routesMap.prefix}`)
            .query({page: '1'})
            .set('Authorization', `Bearer ${accessToken}`);
        expect(response.status).toEqual(200);
    });

    it('GET with admin rights and valid parameters should produce pagination result', async () => {
        const responseAdminToken = await request(server)
            .post(`${apiRootPath}${tokenRoutesMap.prefix}${tokenRoutesMap["token-get"]}`)
            .send({username: adminUser.username, password: adminUser.password});
        const accessToken = responseAdminToken.body.token;

        let response = await request(server)
            .get(`${apiRootPath}${routesMap.prefix}`)
            .set('Authorization', `Bearer ${accessToken}`);
        expect(response.body.page).toEqual(1);
        expect(response.body.items).toBeInstanceOf(Array);
    });

    it('DELETE without authentication should produce state 403', async () => {
        const response = await request(server)
            .delete(`${apiRootPath}${routesMap.prefix}${routesMap["file-remove"]}`)
            .send({id: '0c9dd15c6a259b3818fd3e33'}); // criteria required!

        expect(response.status).toEqual(403);
    });

    it('DELETE without admin rights should produce status 401', async () => {
        const responseReaderToken = await request(server)
            .post(`${apiRootPath}${tokenRoutesMap.prefix}${tokenRoutesMap["token-get"]}`)
            .send({username: readerUser.username, password: readerUser.password});
        const accessToken = responseReaderToken.body.token;

        const response = await request(server)
            .delete(`${apiRootPath}${routesMap.prefix}${routesMap["file-remove"]}`)
            .set('Authorization', `Bearer ${accessToken}`)
            .send({id: '0c9dd15c6a259b3818fd3e33'}); // criteria required!

        expect(response.status).toEqual(401);
    });

    it('DELETE with admin rights and invalid parameters should produce status 400', async () => {
        const responseAdminToken = await request(server)
            .post(`${apiRootPath}${tokenRoutesMap.prefix}${tokenRoutesMap["token-get"]}`)
            .send({username: adminUser.username, password: adminUser.password});
        const accessToken = responseAdminToken.body.token;

        let response = await request(server)
            .delete(`${apiRootPath}${routesMap.prefix}${routesMap["file-remove"]}`)
            .set('Authorization', `Bearer ${accessToken}`)
            .query({badParameter: 'foo'});
        expect(response.status).toEqual(400);

        response = await request(server)
            .delete(`${apiRootPath}${routesMap.prefix}${routesMap["file-remove"]}`)
            .set('Authorization', `Bearer ${accessToken}`)
            .send({id: 'bad-objectid-bad-objectid-bad-objectid-bad-objectid-bad-objectid-bad-objectid-bad-objectid-bad-objectid-bad-objectid-bad-objectid-bad-objectid-bad-objectid-bad-objectid-bad-objectid'});
        expect(response.status).toEqual(400);

        response = await request(server)
            .delete(`${apiRootPath}${routesMap.prefix}${routesMap["file-remove"]}`)
            .send({notexpected: 1, id: ['0c9dd15c6a259b3818fd3e33', '1c9dd15c6a259b3818fd3e33']})
            .set('Authorization', `Bearer ${accessToken}`);
        expect(response.status).toEqual(400);
    });

    it('DELETE with admin rights and valid parameters should produce status 200', async () => {
        const responseAdminToken = await request(server)
            .post(`${apiRootPath}${tokenRoutesMap.prefix}${tokenRoutesMap["token-get"]}`)
            .send({username: adminUser.username, password: adminUser.password});
        const accessToken = responseAdminToken.body.token;

        let response = await request(server)
            .delete(`${apiRootPath}${routesMap.prefix}${routesMap["file-remove"]}`)
            .set('Authorization', `Bearer ${accessToken}`)
            .send({id: '0c9dd15c6a259b3818fd3e33'});
        expect(response.status).toEqual(200);
        // there are no file with passed id, so expect 0 actually deleted items
        expect(response.body).toEqual(0);

        response = await request(server)
            .delete(`${apiRootPath}${routesMap.prefix}${routesMap["file-remove"]}`)
            .set('Authorization', `Bearer ${accessToken}`)
            .send({id: ['0c9dd15c6a259b3818fd3e33', '1c9dd15c6a259b3818fd3e33', '2c9dd15c6a259b3818fd3e33']});
        expect(response.status).toEqual(200);
        // there are no file with passed id, so expect 0 actually deleted items
        expect(response.body).toEqual(0);
    });
});
