import 'reflect-metadata';
import {Server} from "http";
import {TestUtils} from "../../test/utils";
import {routesMap} from "./post-routes-map";
import request from 'supertest';
import {routesMap as tokenRoutesMap} from "../../token/koa-routes/token-routes-map";
import {container} from "../../ioc/container";
import {IPostAllDetailsPopulatedDocument} from "../dto/post-all-details-populated-document";
import {Model} from "mongoose";
import {TYPES} from "../../ioc/types";
import {runServer} from "../../server-up";

let server: Server;
const postIdsToClearAfterTest: string[] = [];
const {
    addTestUsers,
    adminUser, apiRootPath, clearTestPosts,
    clearTestUsers,
    readerUser,
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
    await clearTestPosts(postIdsToClearAfterTest);
    await clearTestUsers();
    await tearDownHttpAndMongoose(server);
});

describe(`Routes ${apiRootPath}${routesMap.prefix}`, () => {
    describe(`POST ${apiRootPath}${routesMap.prefix}${routesMap["post-get-create-update-remove"]}`, () => {

        it('With invalid parameters should produce status 400', async () => {
            let response = await request(server)
                .post(`${apiRootPath}${routesMap.prefix}${routesMap["post-get-create-update-remove"]}`)
                .send({
                    status: 'FOO'
                });
            expect(response.status).toEqual(400);

            response = await request(server)
                .post(`${apiRootPath}${routesMap.prefix}${routesMap["post-get-create-update-remove"]}`)
                .send({
                    status: 'DRAFT',
                    title: 'INVALID REQUEST'
                });
            expect(response.status).toEqual(400);

            response = await request(server)
                .post(`${apiRootPath}${routesMap.prefix}${routesMap["post-get-create-update-remove"]}`)
                .send({
                    status: 'DRAFT',
                    allowRead: 'FOR_ME',
                    contentType: 'MD',
                    title: 'Invalid request',
                    brief: 'Brief',
                    content: 'Content',
                    tags: [],
                    attachments: [],
                    unexpected_param: 'FOO'
                });
            expect(response.status).toEqual(400);

            response = await request(server)
                .post(`${apiRootPath}${routesMap.prefix}${routesMap["post-get-create-update-remove"]}`);
            expect(response.status).toEqual(400);
        });

        it('With not admin user should produce status 401', async () => {
            const readerResponseToken = await request(server)
                .post(`${apiRootPath}${tokenRoutesMap.prefix}${tokenRoutesMap["token-get"]}`)
                .send({username: readerUser.username, password: readerUser.password});
            const readerAccessToken = readerResponseToken.body.token;

            const response = await request(server)
                .post(`${apiRootPath}${routesMap.prefix}${routesMap["post-get-create-update-remove"]}`)
                .set('Authorization', `Bearer ${readerAccessToken}`)
                .send({
                    status: 'DRAFT',
                    allowRead: 'FOR_ME',
                    contentType: 'MD',
                    title: 'Valid request',
                    brief: 'Brief',
                    content: 'Content',
                    tags: [],
                    attachments: [],
                });
            expect(response.status).toEqual(401);
        });

        it('With anonym user should produce status 403', async () => {
            const response = await request(server)
                .post(`${apiRootPath}${routesMap.prefix}${routesMap["post-get-create-update-remove"]}`)
                .send({
                    status: 'DRAFT',
                    allowRead: 'FOR_ME',
                    contentType: 'MD',
                    title: 'Valid request',
                    brief: 'Brief',
                    content: 'Content',
                    tags: [],
                    attachments: [],
                });
            expect(response.status).toEqual(403);
        });

        it('With admin user should produce status 200 and IPostAllDetailsPopulated', async () => {
            const adminResponseToken = await request(server)
                .post(`${apiRootPath}${tokenRoutesMap.prefix}${tokenRoutesMap["token-get"]}`)
                .send({username: adminUser.username, password: adminUser.password});
            const adminAccessToken = adminResponseToken.body.token;

            const response = await request(server)
                .post(`${apiRootPath}${routesMap.prefix}${routesMap["post-get-create-update-remove"]}`)
                .set('Authorization', `Bearer ${adminAccessToken}`)
                .send({
                    status: 'DRAFT',
                    allowRead: 'FOR_ME',
                    contentType: 'MD',
                    title: 'Valid request',
                    brief: 'Brief',
                    content: 'Content',
                    tags: [],
                    attachments: [],
                });
            expect(response.status).toEqual(200);
            expect(response.body).toHaveProperty('_id');
            postIdsToClearAfterTest.push(response.body._id);
            expect(response.body.title).toEqual('Valid request');
        });

    });

    describe(`PUT ${apiRootPath}${routesMap["post-get-create-update-remove"]}`, () => {
        it('With invalid parameters should produce status 400', async () => {
            let response = await request(server)
                .put(`${apiRootPath}${routesMap.prefix}${routesMap["post-get-create-update-remove"]}`)
                .send({
                    status: 'FOO'
                });
            expect(response.status).toEqual(400);

            response = await request(server)
                .put(`${apiRootPath}${routesMap.prefix}${routesMap["post-get-create-update-remove"]}`)
                .send({
                    status: 'DRAFT',
                    title: 'INVALID REQUEST'
                });
            expect(response.status).toEqual(400);

            response = await request(server)
                .put(`${apiRootPath}${routesMap.prefix}${routesMap["post-get-create-update-remove"]}`)
                .send({
                    _id: '0cb051abd01f7f4c804f993a',
                    status: 'DRAFT',
                    allowRead: 'FOR_ME',
                    contentType: 'MD',
                    title: 'Invalid request',
                    brief: 'Brief',
                    content: 'Content',
                    tags: [],
                    attachments: [],
                    unexpected_param: 'FOO'
                });
            expect(response.status).toEqual(400);

            response = await request(server)
                .put(`${apiRootPath}${routesMap.prefix}${routesMap["post-get-create-update-remove"]}`);
            expect(response.status).toEqual(400);
        });

        it('Update with not existent post should produce status 400', async () => {
            const adminResponseToken = await request(server)
                .post(`${apiRootPath}${tokenRoutesMap.prefix}${tokenRoutesMap["token-get"]}`)
                .send({username: adminUser.username, password: adminUser.password});
            const adminAccessToken = adminResponseToken.body.token;

            let response = await request(server)
                .put(`${apiRootPath}${routesMap.prefix}${routesMap["post-get-create-update-remove"]}`)
                .set('Authorization', `Bearer ${adminAccessToken}`)
                .send({
                    // no post with such _id
                    _id: '0cb051abd01f7f4c804f993a',
                    status: 'DRAFT',
                    allowRead: 'FOR_ME',
                    contentType: 'MD',
                    title: 'Invalid _id',
                    brief: 'Brief',
                    content: 'Content',
                    tags: [],
                    attachments: [],
                });
            expect(response.status).toEqual(400);
        });

        it('Update with not admin user should produce status 401', async () => {
            const readerResponseToken = await request(server)
                .post(`${apiRootPath}${tokenRoutesMap.prefix}${tokenRoutesMap["token-get"]}`)
                .send({username: readerUser.username, password: readerUser.password});
            const readerAccessToken = readerResponseToken.body.token;

            let response = await request(server)
                .put(`${apiRootPath}${routesMap.prefix}${routesMap["post-get-create-update-remove"]}`)
                .set('Authorization', `Bearer ${readerAccessToken}`)
                .send({
                    // no post with such _id
                    _id: '0cb051abd01f7f4c804f993a',
                    status: 'DRAFT',
                    allowRead: 'FOR_ME',
                    contentType: 'MD',
                    title: 'Invalid _id',
                    brief: 'Brief',
                    content: 'Content',
                    tags: [],
                    attachments: [],
                });
            expect(response.status).toEqual(401);
        });

        it('Update with anonym user should produce status 403', async () => {
            let response = await request(server)
                .put(`${apiRootPath}${routesMap.prefix}${routesMap["post-get-create-update-remove"]}`)
                .send({
                    // no post with such _id
                    _id: '0cb051abd01f7f4c804f993a',
                    status: 'DRAFT',
                    allowRead: 'FOR_ME',
                    contentType: 'MD',
                    title: 'Invalid _id',
                    brief: 'Brief',
                    content: 'Content',
                    tags: [],
                    attachments: [],
                });
            expect(response.status).toEqual(403);
        });

        it('Update with admin user and valid parameters should produce status 200 and IPostAllDetails', async () => {
            const adminResponseToken = await request(server)
                .post(`${apiRootPath}${tokenRoutesMap.prefix}${tokenRoutesMap["token-get"]}`)
                .send({username: adminUser.username, password: adminUser.password});
            const adminAccessToken = adminResponseToken.body.token;

            // first create post
            const responseCreate = await request(server)
                .post(`${apiRootPath}${routesMap.prefix}${routesMap["post-get-create-update-remove"]}`)
                .set('Authorization', `Bearer ${adminAccessToken}`)
                .send({
                    status: 'DRAFT',
                    allowRead: 'FOR_ME',
                    contentType: 'MD',
                    title: 'Valid request to check update',
                    brief: 'Brief',
                    content: 'Content',
                    tags: [],
                    attachments: [],
                });

            const postId = responseCreate.body._id;
            postIdsToClearAfterTest.push(postId);

            // now try to update it
            const response = await request(server)
                .put(`${apiRootPath}${routesMap.prefix}${routesMap["post-get-create-update-remove"]}`)
                .set('Authorization', `Bearer ${adminAccessToken}`)
                .send({
                    _id: postId,
                    status: 'DRAFT',
                    allowRead: 'FOR_ME',
                    contentType: 'MD',
                    title: 'Updated title',
                    brief: 'Brief',
                    content: 'Content',
                    tags: [],
                    attachments: [],
                });
            expect(response.status).toEqual(200);
            expect(response.body._id).toEqual(postId);
            expect(response.body.title).toEqual('Updated title');
        });
    });

    describe(`POST ${apiRootPath}${routesMap.prefix}${routesMap.export}`, () => {
        it('With invalid paramepers should produce status 400', async () => {
            let response = await request(server)
                .post(`${apiRootPath}${routesMap.prefix}${routesMap.export}`)
                .send({
                    status: 'FOO'
                });
            expect(response.status).toEqual(400);

            response = await request(server)
                .post(`${apiRootPath}${routesMap.prefix}${routesMap.export}`)
                .send([
                    {
                        _id: '0cb051abd01f7f4c804f993a',
                        status: 'DRAFT',
                        allowRead: 'FOR_ME',
                        createDate: new Date('01/02/2018'),
                        pubDate: null,
                        updateDate: new Date('01/03/2018'),
                        contentType: 'MD',
                        title: 'Title of invalid',
                        content: 'COntent',
                        tags: [],
                        titleImg: null,
                        attachments: [],
                        unexpectedProp: 'FOO'
                    },
                    {
                        _id: '1cb051abd01f7f4c804f993a',
                        status: 'DRAFT',
                        allowRead: 'FOR_ME',
                        createDate: new Date('01/02/2018'),
                        pubDate: null,
                        updateDate: new Date('01/03/2018'),
                        contentType: 'MD',
                        title: 'Title of invalid',
                        content: 'COntent',
                        tags: [],
                        titleImg: null,
                        attachments: [],
                    }
                ]);
            expect(response.status).toEqual(400);

            response = await request(server)
                .post(`${apiRootPath}${routesMap.prefix}${routesMap.export}`);
            expect(response.status).toEqual(400);
        });

        it('With non admin user should produce status 401', async () => {
            const readerResponseToken = await request(server)
                .post(`${apiRootPath}${tokenRoutesMap.prefix}${tokenRoutesMap["token-get"]}`)
                .send({username: readerUser.username, password: readerUser.password});
            const readerAccessToken = readerResponseToken.body.token;

            let response = await request(server)
                .post(`${apiRootPath}${routesMap.prefix}${routesMap.export}`)
                .set('Authorization', `Bearer ${readerAccessToken}`)
                .send([
                    {
                        _id: '1cb051abd01f7f4c804f993a',
                        status: 'DRAFT',
                        allowRead: 'FOR_ME',
                        createDate: new Date('01/02/2018'),
                        pubDate: null,
                        updateDate: new Date('01/03/2018'),
                        contentType: 'MD',
                        title: 'Title of invalid',
                        content: 'COntent',
                        tags: [],
                        titleImg: null,
                        attachments: [],
                    }
                ]);
            expect(response.status).toEqual(401);
        });

        it('Without auth should produce status 403', async () => {
            let response = await request(server)
                .post(`${apiRootPath}${routesMap.prefix}${routesMap.export}`)
                .send([
                    {
                        _id: '1cb051abd01f7f4c804f993a',
                        status: 'DRAFT',
                        allowRead: 'FOR_ME',
                        createDate: new Date('01/02/2018'),
                        pubDate: null,
                        updateDate: new Date('01/03/2018'),
                        contentType: 'MD',
                        title: 'Title of invalid',
                        content: 'COntent',
                        tags: [],
                        titleImg: null,
                        attachments: [],
                    }
                ]);
            expect(response.status).toEqual(403);
        });

        it('Admin and valid parameters should produce status 200 and response', async () => {
            const adminResponseToken = await request(server)
                .post(`${apiRootPath}${tokenRoutesMap.prefix}${tokenRoutesMap["token-get"]}`)
                .send({username: adminUser.username, password: adminUser.password});
            const adminAccessToken = adminResponseToken.body.token;

            postIdsToClearAfterTest.push('2cb051abd01f7f4c804f993a', '2cb051abd01f7f4c804f993b', '2cb051abd01f7f4c804f993c');
            let response = await request(server)
                .post(`${apiRootPath}${routesMap.prefix}${routesMap.export}`)
                .set('Authorization', `Bearer ${adminAccessToken}`)
                .send([
                    {
                        _id: '2cb051abd01f7f4c804f993a',
                        status: 'DRAFT',
                        allowRead: 'FOR_ME',
                        createDate: new Date('01/02/2018'),
                        pubDate: null,
                        updateDate: new Date('01/03/2018'),
                        contentType: 'MD',
                        title: 'Title of 1',
                        content: 'COntent',
                        tags: [],
                        titleImg: null,
                        attachments: [],
                    },
                    {
                        _id: '2cb051abd01f7f4c804f993b',
                        status: 'DRAFT',
                        allowRead: 'FOR_ME',
                        createDate: new Date('01/02/2018'),
                        pubDate: null,
                        updateDate: new Date('01/03/2018'),
                        contentType: 'MD',
                        title: 'Title of 2',
                        content: 'COntent',
                        tags: [],
                        titleImg: null,
                        attachments: [],
                    },
                    {
                        _id: '2cb051abd01f7f4c804f993c',
                        status: 'DRAFT',
                        allowRead: 'FOR_ME',
                        createDate: new Date('01/02/2018'),
                        pubDate: null,
                        updateDate: new Date('01/03/2018'),
                        contentType: 'MD',
                        title: 'Title of 3',
                        content: 'COntent',
                        tags: [],
                        titleImg: null,
                        attachments: [],
                    }
                ]);
            expect(response.status).toEqual(200);
            expect(response.body.length).toEqual(3);
            expect(response.body[0]._id).toEqual('2cb051abd01f7f4c804f993a');
        });
    });

    describe(`GET ${apiRootPath}${routesMap.prefix}${routesMap["post-get-create-update-remove"]}`, () => {
        it('With not admin user should produce status 401', async () => {
            const readerResponseToken = await request(server)
                .post(`${apiRootPath}${tokenRoutesMap.prefix}${tokenRoutesMap["token-get"]}`)
                .send({username: readerUser.username, password: readerUser.password});
            const readerAccessToken = readerResponseToken.body.token;

            let response = await request(server)
                .get(`${apiRootPath}${routesMap.prefix}${routesMap["post-get-create-update-remove"]}`)
                .set('Authorization', `Bearer ${readerAccessToken}`)
                .query({id: '2cb051abd01f7f4c804f993a'});
            expect(response.status).toEqual(401);
        });

        it('With anon user should produce status 403', async () => {
            let response = await request(server)
                .get(`${apiRootPath}${routesMap.prefix}${routesMap["post-get-create-update-remove"]}`)
                .query({id: '2cb051abd01f7f4c804f993a'});
            expect(response.status).toEqual(403);
        });

        it('With invalid parameter should produce status 400', async () => {
            const adminResponseToken = await request(server)
                .post(`${apiRootPath}${tokenRoutesMap.prefix}${tokenRoutesMap["token-get"]}`)
                .send({username: adminUser.username, password: adminUser.password});
            const adminAccessToken = adminResponseToken.body.token;

            let response = await request(server)
                .get(`${apiRootPath}${routesMap.prefix}${routesMap["post-get-create-update-remove"]}`)
                .set('Authorization', `Bearer ${adminAccessToken}`)
                .query({id: '2cb051abd01f7f4c804f993a', unexpected: 'FOO'});
            expect(response.status).toEqual(400);

            response = await request(server)
                .get(`${apiRootPath}${routesMap.prefix}${routesMap["post-get-create-update-remove"]}`)
                .set('Authorization', `Bearer ${adminAccessToken}`)
                .query({id: 'INVALID-OBJECTID'});
            expect(response.status).toEqual(400);

            response = await request(server)
                .get(`${apiRootPath}${routesMap.prefix}${routesMap["post-get-create-update-remove"]}`)
                .set('Authorization', `Bearer ${adminAccessToken}`);
            expect(response.status).toEqual(400);
        });

        it('If post not found should produce status 404', async () => {
            const adminResponseToken = await request(server)
                .post(`${apiRootPath}${tokenRoutesMap.prefix}${tokenRoutesMap["token-get"]}`)
                .send({username: adminUser.username, password: adminUser.password});
            const adminAccessToken = adminResponseToken.body.token;

            let response = await request(server)
                .get(`${apiRootPath}${routesMap.prefix}${routesMap["post-get-create-update-remove"]}`)
                .set('Authorization', `Bearer ${adminAccessToken}`)
                .query({id: '2cb051abd01f7f4c80000000'});
            expect(response.status).toEqual(404);
        });

        it('Valid id and admin user - we should get status 200 and IPostAllDetails', async () => {
            const adminResponseToken = await request(server)
                .post(`${apiRootPath}${tokenRoutesMap.prefix}${tokenRoutesMap["token-get"]}`)
                .send({username: adminUser.username, password: adminUser.password});
            const adminAccessToken = adminResponseToken.body.token;

            let response = await request(server)
                .get(`${apiRootPath}${routesMap.prefix}${routesMap["post-get-create-update-remove"]}`)
                .set('Authorization', `Bearer ${adminAccessToken}`)
                // post that was created in previous test!
                .query({id: '2cb051abd01f7f4c804f993a'});
            expect(response.status).toEqual(200);
            expect(response.body._id).toEqual('2cb051abd01f7f4c804f993a');
            expect(response.body.author).toEqual(adminUser.username);
        });
    });

    describe(`GET ${apiRootPath}${routesMap.prefix}${routesMap.import}`, () => {

        let testPosts: IPostAllDetailsPopulatedDocument[];

        beforeAll(async () => {
            // test entity for test
            const ModelPost = container.get<Model<IPostAllDetailsPopulatedDocument>>(TYPES.ModelPost);
            testPosts = await ModelPost.create([
                {
                    status: 'DRAFT',
                    allowRead: 'FOR_ME',
                    createDate: new Date('01/02/2018'),
                    pubDate: null,
                    updateDate: new Date('01/03/2018'),
                    contentType: 'MD',
                    title: 'For test import 1',
                    content: 'Content 1',
                    tags: [],
                    titleImg: null,
                    attachments: [],
                    author: adminUser.username,
                },
                {
                    // this entity is owned by other user!
                    status: 'DRAFT',
                    allowRead: 'FOR_ME',
                    createDate: new Date('01/02/2018'),
                    pubDate: null,
                    updateDate: new Date('01/03/2018'),
                    contentType: 'MD',
                    title: 'For test import 2',
                    content: 'Content 2',
                    tags: [],
                    titleImg: null,
                    attachments: [],
                    author: 'Some_other_user'
                }
            ]);
        });

        afterAll(async () => {
            // clear test entity
            // const ModelPost = container.get<Model<IPostAllDetailsPopulatedDocument>>(TYPES.ModelPost);
            // await ModelPost.deleteMany({
            //     _id: {$in: testPosts.map(p => p._id)}
            // });
            await Promise.all(testPosts.map(p => p.remove()));
        });

        it('Winth invalid params should produce status 400', async () => {

            let response = await request(server)
                .get(`${apiRootPath}${routesMap.prefix}${routesMap.import}`);
            expect(response.status).toEqual(400);

            response = await request(server)
                .get(`${apiRootPath}${routesMap.prefix}${routesMap.import}`)
                .query({
                    unexpected_param: 'FOO'
                });
            expect(response.status).toEqual(400);

            response = await request(server)
                .get(`${apiRootPath}${routesMap.prefix}${routesMap.import}`)
                .query({
                    id: 'INVALID_OBJECTID'
                });
            expect(response.status).toEqual(400);

            response = await request(server)
                .get(`${apiRootPath}${routesMap.prefix}${routesMap.import}`)
                .query({
                    id: ['INVALID_OBJECTID', 'INVALID_OBJECTID_2']
                });
            expect(response.status).toEqual(400);

            response = await request(server)
                .get(`${apiRootPath}${routesMap.prefix}${routesMap.import}`)
                .query({
                    // non unique
                    id: ['5d27503ac60077614ca6ddd2', '5d27503ac60077614ca6ddd2']
                });
            expect(response.status).toEqual(400);
        });

        it('With not admin user should produce status 401', async () => {
            const readerResponseToken = await request(server)
                .post(`${apiRootPath}${tokenRoutesMap.prefix}${tokenRoutesMap["token-get"]}`)
                .send({username: readerUser.username, password: readerUser.password});
            const readerAccessToken = readerResponseToken.body.token;

            let response = await request(server)
                .get(`${apiRootPath}${routesMap.prefix}${routesMap.import}`)
                .set('Authorization', `Bearer ${readerAccessToken}`)
                .query({id: '5d27503ac60077614ca6ddd2'});
            expect(response.status).toEqual(401);
        });

        it('With anonym user should produce status 403', async () => {
            let response = await request(server)
                .get(`${apiRootPath}${routesMap.prefix}${routesMap.import}`)
                .query({id: '5d27503ac60077614ca6ddd2'});
            expect(response.status).toEqual(403);
        });

        it('With valid param and admin user should produce status 200 and IPostPermanent[] (posts have to be owned by authized user)', async () => {
            const adminResponseToken = await request(server)
                .post(`${apiRootPath}${tokenRoutesMap.prefix}${tokenRoutesMap["token-get"]}`)
                .send({username: adminUser.username, password: adminUser.password});
            const adminAccessToken = adminResponseToken.body.token;

            let response = await request(server)
                .get(`${apiRootPath}${routesMap.prefix}${routesMap.import}`)
                .set('Authorization', `Bearer ${adminAccessToken}`)
                // in testPosts: Mongo Document with wrapped _id
                .query({id: testPosts.map(p => p._id.toString())});
            expect(response.status).toEqual(200);
            expect(response.body.length).toEqual(1);
            expect(response.body[0]._id).toEqual(testPosts[0]._id.toString());
        });
    });

    describe(`GET ${apiRootPath}${routesMap.prefix}${routesMap.find}`, () => {
        let testPosts: IPostAllDetailsPopulatedDocument[];
        beforeAll(async () => {
            // test entity for test
            const ModelPost = container.get<Model<IPostAllDetailsPopulatedDocument>>(TYPES.ModelPost);
            testPosts = await ModelPost.create([
                {
                    status: 'DRAFT',
                    allowRead: 'FOR_ME',
                    createDate: new Date('01/01/1975'),
                    pubDate: null,
                    updateDate: new Date('01/03/2018'),
                    contentType: 'MD',
                    title: 'For test import 1',
                    content: 'Content 1',
                    tags: [],
                    titleImg: null,
                    attachments: [],
                    author: adminUser.username,
                },
                {
                    // this entity is owned by other user!
                    status: 'DRAFT',
                    allowRead: 'FOR_ME',
                    createDate: new Date('01/01/1975'),
                    pubDate: null,
                    updateDate: new Date('01/03/2018'),
                    contentType: 'MD',
                    title: 'For test import 2',
                    content: 'Content 2',
                    tags: [],
                    titleImg: null,
                    attachments: [],
                    author: 'Some_other_user'
                }
            ]);
        });

        afterAll(async () => {
            await Promise.all(testPosts.map(p => p.remove()));
        });


        it('With invalid parameters should produce status 400', async () => {
            let response = await request(server)
                .get(`${apiRootPath}${routesMap.prefix}${routesMap.find}`)
                .query({
                    q: 'some',
                    unexpected_param: 'FOO',
                });
            expect(response.status).toEqual(400);

            response = await request(server)
                .get(`${apiRootPath}${routesMap.prefix}${routesMap.find}`)
                .query({
                    statuses: 'INVALID_STATUS'
                });
            expect(response.status).toEqual(400);

            response = await request(server)
                .get(`${apiRootPath}${routesMap.prefix}${routesMap.find}`)
                .query({
                    statuses: 'DRAFT',
                    to: 'INVALID_DATE',
                });
            expect(response.status).toEqual(400);
        });
        it('With anonym user should produce status 403', async () => {
            const response = await request(server)
                .get(`${apiRootPath}${routesMap.prefix}${routesMap.find}`)
                .query({
                    statuses: 'PUB'
                });
            expect(response.status).toEqual(403);
        });
        it('With not admin user should produce status 401', async () => {
            const readerResponseToken = await request(server)
                .post(`${apiRootPath}${tokenRoutesMap.prefix}${tokenRoutesMap["token-get"]}`)
                .send({username: readerUser.username, password: readerUser.password});
            const readerAccessToken = readerResponseToken.body.token;

            let response = await request(server)
                .get(`${apiRootPath}${routesMap.prefix}${routesMap.find}`)
                .set('Authorization', `Bearer ${readerAccessToken}`);
            expect(response.status).toEqual(401);
        });
        it('With valid criteria and admin user should produce status 200 and pagination response', async () => {
            const adminResponseToken = await request(server)
                .post(`${apiRootPath}${tokenRoutesMap.prefix}${tokenRoutesMap["token-get"]}`)
                .send({username: adminUser.username, password: adminUser.password});
            const adminAccessToken = adminResponseToken.body.token;

            let response = await request(server)
                .get(`${apiRootPath}${routesMap.prefix}${routesMap.find}`)
                .set('Authorization', `Bearer ${adminAccessToken}`);
            expect(response.status).toEqual(200);
            expect(response.body).toHaveProperty('items');
            expect(response.body).toHaveProperty('page');
            expect(response.body).toHaveProperty('itemsPerPage');
            expect(response.body).toHaveProperty('hasMore');

            // with criteria
            response = await request(server)
                .get(`${apiRootPath}${routesMap.prefix}${routesMap.find}`)
                .set('Authorization', `Bearer ${adminAccessToken}`)
                .query({
                    to: '01/01/1971'
                });
            expect(response.status).toEqual(200);
            expect(response.body).toHaveProperty('items');
            expect(response.body).toHaveProperty('page');
            expect(response.body).toHaveProperty('itemsPerPage');
            expect(response.body).toHaveProperty('hasMore');
            expect(response.body.items.length).toEqual(0);

            // search testPosts
            response = await request(server)
                .get(`${apiRootPath}${routesMap.prefix}${routesMap.find}`)
                .set('Authorization', `Bearer ${adminAccessToken}`)
                .query({
                    from: '01/01/1975',
                    to: '01/01/1975',
                });
            expect(response.status).toEqual(200);
            expect(response.body).toHaveProperty('items');
            expect(response.body).toHaveProperty('page');
            expect(response.body).toHaveProperty('itemsPerPage');
            expect(response.body).toHaveProperty('hasMore');
            expect(response.body.items.length).toEqual(1);
            // We receive one item. That owned (i.e. 'author') by current user
            expect(response.body.page).toEqual(1);
            expect(response.body.hasMore).toBeFalsy();
        });
    });

    describe(`GET ${apiRootPath}${routesMap.prefix}${routesMap["public-get"]}`, () => {
        let testPosts: IPostAllDetailsPopulatedDocument[];
        beforeAll(async () => {
            // test entity for test
            const ModelPost = container.get<Model<IPostAllDetailsPopulatedDocument>>(TYPES.ModelPost);
            testPosts = await ModelPost.create([
                {
                    status: 'PUB',
                    allowRead: 'FOR_ALL',
                    createDate: new Date('01/01/1975'),
                    pubDate: null,
                    updateDate: new Date('01/03/2018'),
                    contentType: 'MD',
                    title: 'Published for all',
                    content: 'Content 1',
                    tags: [],
                    titleImg: null,
                    attachments: [],
                    author: adminUser.username,
                    hru: 'human-readable-url'
                },
                {
                    status: 'PUB',
                    allowRead: 'FOR_REGISTERED',
                    createDate: new Date('01/01/1975'),
                    pubDate: null,
                    updateDate: new Date('01/03/2018'),
                    contentType: 'MD',
                    title: 'Published for registered users',
                    content: 'Content 2',
                    tags: [],
                    titleImg: null,
                    attachments: [],
                    author: adminUser.username
                },
                {
                    status: 'PUB',
                    allowRead: 'FOR_ME',
                    createDate: new Date('01/01/1975'),
                    pubDate: null,
                    updateDate: new Date('01/03/2018'),
                    contentType: 'MD',
                    title: 'Published for me',
                    content: 'Content 3',
                    tags: [],
                    titleImg: null,
                    attachments: [],
                    author: adminUser.username
                },
                {
                    status: 'DRAFT',
                    allowRead: 'FOR_ALL',
                    createDate: new Date('01/01/1975'),
                    pubDate: null,
                    updateDate: new Date('01/03/2018'),
                    contentType: 'MD',
                    title: 'Draft',
                    content: 'Content 4',
                    tags: [],
                    titleImg: null,
                    attachments: [],
                    author: adminUser.username
                }
            ]);
        });

        afterAll(async () => {
            await Promise.all(testPosts.map(p => p.remove()));
        });
        it('With invalid parameter should produce status 400', async () => {
            let response = await request(server)
                .get(`${apiRootPath}${routesMap.prefix}${routesMap["public-get"]}`)
                // length over limit (id can be objectId or string (hru))
                .query({id: 'INVALID_OBJECTID_QWERTYUI_QWERTYUI_QWERTYUI_QWERTYUI_QWERTYUI_QWERTYUI_QWERTYUI_QWERTYUI_'});
            expect(response.status).toEqual(400);

            response = await request(server)
                .get(`${apiRootPath}${routesMap.prefix}${routesMap["public-get"]}`);
            expect(response.status).toEqual(400);

            response = await request(server)
                .get(`${apiRootPath}${routesMap.prefix}${routesMap["public-get"]}`)
                .query({id: '5d25f0b5fdcfed42c8fdeb2c', unexpected_param: 'FOO'});
            expect(response.status).toEqual(400);

            response = await request(server)
                .get(`${apiRootPath}${routesMap.prefix}${routesMap["public-get"]}`)
                .query({id: ['5d25f0b5fdcfed42c8fdeb2c', '5d25f28787e0b368a467007b']});
            expect(response.status).toEqual(400);
        });
        it('With valid id should produce status 200 and IPostAllDetails by objectId', async () => {
            let response = await request(server)
                .get(`${apiRootPath}${routesMap.prefix}${routesMap["public-get"]}`)
                .query({id: testPosts[0]._id.toString()});
            expect(response.status).toEqual(200);
            expect(response.body._id).toEqual(testPosts[0]._id.toString());
        });
        it('With valid id should produce status 200 and IPostAllDetails by hru identificator', async () => {
            let response = await request(server)
                .get(`${apiRootPath}${routesMap.prefix}${routesMap["public-get"]}`)
                .query({id: testPosts[0].hru});
            expect(response.status).toEqual(200);
            expect(response.body._id).toEqual(testPosts[0]._id.toString());
        });
        it('FOR_REGISTERED can view only not anonym user', async () => {
            const readerResponseToken = await request(server)
                .post(`${apiRootPath}${tokenRoutesMap.prefix}${tokenRoutesMap["token-get"]}`)
                .send({username: readerUser.username, password: readerUser.password});
            const readerAccessToken = readerResponseToken.body.token;

            let response = await request(server)
                .get(`${apiRootPath}${routesMap.prefix}${routesMap["public-get"]}`)
                .set('Authorization', `Bearer ${readerAccessToken}`)
                .query({id: testPosts[1]._id.toString()});
            expect(response.status).toEqual(200);
            expect(response.body._id).toEqual(testPosts[1]._id.toString());

            response = await request(server)
                .get(`${apiRootPath}${routesMap.prefix}${routesMap["public-get"]}`)
                .query({id: testPosts[1]._id.toString()});
            expect(response.status).toEqual(401);
        });
        it('FOR_ME can view only author', async () => {
            const readerResponseToken = await request(server)
                .post(`${apiRootPath}${tokenRoutesMap.prefix}${tokenRoutesMap["token-get"]}`)
                .send({username: readerUser.username, password: readerUser.password});
            const readerAccessToken = readerResponseToken.body.token;

            const adminResponseToken = await request(server)
                .post(`${apiRootPath}${tokenRoutesMap.prefix}${tokenRoutesMap["token-get"]}`)
                .send({username: adminUser.username, password: adminUser.password});
            const adminAccessToken = adminResponseToken.body.token;

            let response = await request(server)
                .get(`${apiRootPath}${routesMap.prefix}${routesMap["public-get"]}`)
                .query({id: testPosts[2]._id.toString()});
            expect(response.status).toEqual(401);

            response = await request(server)
                .get(`${apiRootPath}${routesMap.prefix}${routesMap["public-get"]}`)
                .set('Authorization', `Bearer ${readerAccessToken}`)
                .query({id: testPosts[2]._id.toString()});
            expect(response.status).toEqual(401);

            response = await request(server)
                .get(`${apiRootPath}${routesMap.prefix}${routesMap["public-get"]}`)
                .set('Authorization', `Bearer ${adminAccessToken}`)
                .query({id: testPosts[2]._id.toString()});
            expect(response.status).toEqual(200);
            expect(response.body._id).toEqual(testPosts[2]._id.toString());
        });
        it('DRAFT can see only author', async () => {
            const readerResponseToken = await request(server)
                .post(`${apiRootPath}${tokenRoutesMap.prefix}${tokenRoutesMap["token-get"]}`)
                .send({username: readerUser.username, password: readerUser.password});
            const readerAccessToken = readerResponseToken.body.token;

            const adminResponseToken = await request(server)
                .post(`${apiRootPath}${tokenRoutesMap.prefix}${tokenRoutesMap["token-get"]}`)
                .send({username: adminUser.username, password: adminUser.password});
            const adminAccessToken = adminResponseToken.body.token;

            let response = await request(server)
                .get(`${apiRootPath}${routesMap.prefix}${routesMap["public-get"]}`)
                .query({id: testPosts[3]._id.toString()});
            expect(response.status).toEqual(401);

            response = await request(server)
                .get(`${apiRootPath}${routesMap.prefix}${routesMap["public-get"]}`)
                .set('Authorization', `Bearer ${readerAccessToken}`)
                .query({id: testPosts[3]._id.toString()});
            expect(response.status).toEqual(401);

            response = await request(server)
                .get(`${apiRootPath}${routesMap.prefix}${routesMap["public-get"]}`)
                .set('Authorization', `Bearer ${adminAccessToken}`)
                .query({id: testPosts[3]._id.toString()});
            expect(response.status).toEqual(200);
            expect(response.body._id).toEqual(testPosts[3]._id.toString());
        });
    });

    describe(`PUT ${apiRootPath}${routesMap.prefix}${routesMap["update-status"]}`, () => {
        it('With invalid paramaters should produce status 400', async () => {
            let response = await request(server)
                .put(`${apiRootPath}${routesMap.prefix}${routesMap["update-status"]}`)
                .send({
                    id: ['5d25f3b54c302b5b4c1a1e9e', '5d25f4584c302b5b4c1a1ea0'],
                    status: 'FOO'
                });
            expect(response.status).toEqual(400);

            response = await request(server)
                .put(`${apiRootPath}${routesMap.prefix}${routesMap["update-status"]}`)
                .send({
                    status: 'DRAFT',
                });
            expect(response.status).toEqual(400);

            response = await request(server)
                .put(`${apiRootPath}${routesMap.prefix}${routesMap["update-status"]}`)
                .send({
                    id: ['5d25f3b54c302b5b4c1a1e9e', '5d25f3b54c302b5b4c1a1e9e'],
                    status: 'DRAFT'
                });
            expect(response.status).toEqual(400);

            response = await request(server)
                .put(`${apiRootPath}${routesMap.prefix}${routesMap["update-status"]}`)
                .send({
                    id: ['5d25f3b54c302b5b4c1a1e9e', '5d25f4584c302b5b4c1a1ea0'],
                    status: 'DRAFT',
                    unexpected_param: 'FOO'
                });
            expect(response.status).toEqual(400);

            response = await request(server)
                .put(`${apiRootPath}${routesMap.prefix}${routesMap["update-status"]}`);
            expect(response.status).toEqual(400);
        });
        it('With anonym user should produce status 403', async () => {
            let response = await request(server)
                .put(`${apiRootPath}${routesMap.prefix}${routesMap["update-status"]}`)
                .send({
                    id: ['5d25f3b54c302b5b4c1a1e9e', '5d25f4584c302b5b4c1a1ea0'],
                    status: 'DRAFT'
                });
            expect(response.status).toEqual(403);
        });
        it('With not admin user should produce status 401', async () => {
            const readerResponseToken = await request(server)
                .post(`${apiRootPath}${tokenRoutesMap.prefix}${tokenRoutesMap["token-get"]}`)
                .send({username: readerUser.username, password: readerUser.password});
            const readerAccessToken = readerResponseToken.body.token;

            let response = await request(server)
                .put(`${apiRootPath}${routesMap.prefix}${routesMap["update-status"]}`)
                .set('Authorization', `Bearer ${readerAccessToken}`)
                .send({
                    id: ['5d25f3b54c302b5b4c1a1e9e', '5d25f4584c302b5b4c1a1ea0'],
                    status: 'DRAFT'
                });
            expect(response.status).toEqual(401);
        });
        it('With valid param and admin user should produce status 200', async () => {
            const adminResponseToken = await request(server)
                .post(`${apiRootPath}${tokenRoutesMap.prefix}${tokenRoutesMap["token-get"]}`)
                .send({username: adminUser.username, password: adminUser.password});
            const adminAccessToken = adminResponseToken.body.token;

            let response = await request(server)
                .put(`${apiRootPath}${routesMap.prefix}${routesMap["update-status"]}`)
                .set('Authorization', `Bearer ${adminAccessToken}`)
                .send({
                    // not existent
                    id: ['5d25f3b54c302b5b4c1a1e9e', '5d25f4584c302b5b4c1a1ea0'],
                    status: 'DRAFT'
                });
            expect(response.status).toEqual(200);
        })
    });

    describe(`GET ${apiRootPath}${routesMap.prefix}${routesMap["public-find"]}`, () => {
        let testPosts: IPostAllDetailsPopulatedDocument[];
        beforeAll(async () => {
            // test entity for test
            const ModelPost = container.get<Model<IPostAllDetailsPopulatedDocument>>(TYPES.ModelPost);
            testPosts = await ModelPost.create([
                {
                    status: 'PUB',
                    allowRead: 'FOR_ALL',
                    createDate: new Date('01/01/1975'),
                    pubDate: null,
                    updateDate: new Date('01/03/2018'),
                    contentType: 'MD',
                    title: 'Published for all',
                    content: 'Content 1',
                    tags: [],
                    titleImg: null,
                    attachments: [],
                    author: adminUser.username,
                    hru: 'human-readable-url'
                },
                {
                    status: 'PUB',
                    allowRead: 'FOR_REGISTERED',
                    createDate: new Date('01/01/1975'),
                    pubDate: null,
                    updateDate: new Date('01/03/2018'),
                    contentType: 'MD',
                    title: 'Published for registered users',
                    content: 'Content 2',
                    tags: [],
                    titleImg: null,
                    attachments: [],
                    author: adminUser.username
                },
                {
                    status: 'PUB',
                    allowRead: 'FOR_ME',
                    createDate: new Date('01/01/1975'),
                    pubDate: null,
                    updateDate: new Date('01/03/2018'),
                    contentType: 'MD',
                    title: 'Published for me',
                    content: 'Content 3',
                    tags: [],
                    titleImg: null,
                    attachments: [],
                    author: adminUser.username
                },
                {
                    status: 'DRAFT',
                    allowRead: 'FOR_ALL',
                    createDate: new Date('01/01/1975'),
                    pubDate: null,
                    updateDate: new Date('01/03/2018'),
                    contentType: 'MD',
                    title: 'Draft',
                    content: 'Content 4',
                    tags: [],
                    titleImg: null,
                    attachments: [],
                    author: adminUser.username
                }
            ]);
        });

        afterAll(async () => {
            await Promise.all(testPosts.map(p => p.remove()));
        });

        it('With invalid parameters should produce status 400', async () => {
            let response = await request(server)
                .get(`${apiRootPath}${routesMap.prefix}${routesMap["public-find"]}`)
                .query({
                    q: 'some',
                    unexpected_param: 'FOO',
                });
            expect(response.status).toEqual(400);

            response = await request(server)
                .get(`${apiRootPath}${routesMap.prefix}${routesMap["public-find"]}`)
                .query({
                    tag: 'INVALID_TAG_WITH_LONG_LENGTH INVALID_TAG_WITH_LONG_LENGTH INVALID_TAG_WITH_LONG_LENGTH INVALID_TAG_WITH_LONG_LENGTH INVALID_TAG_WITH_LONG_LENGTHINVALID_TAG_WITH_LONG_LENGTH INVALID_TAG_WITH_LONG_LENGTH'
                });
            expect(response.status).toEqual(400);

            response = await request(server)
                .get(`${apiRootPath}${routesMap.prefix}${routesMap["public-find"]}`)
                .query({
                    to: 'INVALID_DATE',
                });
            expect(response.status).toEqual(400);
        });
        it('With valid params should produce status 200 and pagination response', async () => {
            let response = await request(server)
                .get(`${apiRootPath}${routesMap.prefix}${routesMap["public-find"]}`)
                .query({
                    to: '01/01/1971',
                });
            expect(response.status).toEqual(200);
            expect(response.body).toHaveProperty('items');
            expect(response.body).toHaveProperty('hasMore');
            expect(response.body).toHaveProperty('page');
            expect(response.body).toHaveProperty('itemsPerPage');
            expect(response.body.items.length).toEqual(0);
        });
        it('Anonym can get published and FOR_ALL items', async () => {
            const response = await request(server)
                .get(`${apiRootPath}${routesMap.prefix}${routesMap["public-find"]}`)
                .query({
                    from: '01/01/1975',
                    to: '01/02/1975',
                });
            expect(response.status).toEqual(200);
            expect(response.body.items.length).toEqual(1);
        });
        it('FOR_REGISTERED returns only for non anonym user', async () => {
            const readerResponseToken = await request(server)
                .post(`${apiRootPath}${tokenRoutesMap.prefix}${tokenRoutesMap["token-get"]}`)
                .send({username: readerUser.username, password: readerUser.password});
            const readerAccessToken = readerResponseToken.body.token;

            let response = await request(server)
                .get(`${apiRootPath}${routesMap.prefix}${routesMap["public-find"]}`)
                .set('Authorization', `Bearer ${readerAccessToken}`)
                .query({
                    from: '01/01/1975',
                    to: '01/02/1975',
                });
            expect(response.status).toEqual(200);
            expect(response.body.items.length).toEqual(2);
        });
        it('FOR_ME returns only for author', async () => {
            const adminResponseToken = await request(server)
                .post(`${apiRootPath}${tokenRoutesMap.prefix}${tokenRoutesMap["token-get"]}`)
                .send({username: adminUser.username, password: adminUser.password});
            const adminAccessToken = adminResponseToken.body.token;

            let response = await request(server)
                .get(`${apiRootPath}${routesMap.prefix}${routesMap["public-find"]}`)
                .set('Authorization', `Bearer ${adminAccessToken}`)
                .query({
                    from: '01/01/1975',
                    to: '01/02/1975',
                });
            expect(response.status).toEqual(200);
            expect(response.body.items.length).toEqual(3);
        });
    });

    describe(`DELETE ${apiRootPath}${routesMap.prefix}${routesMap["post-get-create-update-remove"]}`, () => {
        let testPosts: IPostAllDetailsPopulatedDocument[];
        beforeAll(async () => {
            // test entity for test
            const ModelPost = container.get<Model<IPostAllDetailsPopulatedDocument>>(TYPES.ModelPost);
            testPosts = await ModelPost.create([
                {
                    status: 'PUB',
                    allowRead: 'FOR_ALL',
                    createDate: new Date('01/01/1975'),
                    pubDate: null,
                    updateDate: new Date('01/03/2018'),
                    contentType: 'MD',
                    title: 'Published for all',
                    content: 'Content 1',
                    tags: [],
                    titleImg: null,
                    attachments: [],
                    author: adminUser.username,
                    hru: 'human-readable-url'
                }
            ]);
        });

        afterAll(async () => {
            await Promise.all(testPosts.map(p => p.remove()));
        });
        it('Anonym should get status 403', async () => {
            let response = await request(server)
                .delete(`${apiRootPath}${routesMap.prefix}${routesMap["post-get-create-update-remove"]}`)
                .send({
                    id: testPosts[0]._id.toString(),
                });
            expect(response.status).toEqual(403);
        });
        it('Not admin should get status 401', async () => {
            const readerResponseToken = await request(server)
                .post(`${apiRootPath}${tokenRoutesMap.prefix}${tokenRoutesMap["token-get"]}`)
                .send({username: readerUser.username, password: readerUser.password});
            const readerAccessToken = readerResponseToken.body.token;

            let response = await request(server)
                .delete(`${apiRootPath}${routesMap.prefix}${routesMap["post-get-create-update-remove"]}`)
                .set('Authorization', `Bearer ${readerAccessToken}`)
                .send({
                    id: testPosts[0]._id.toString(),
                });
            expect(response.status).toEqual(401);
        });
        it('Admin with invalid params should get status 400', async () => {
            const adminResponseToken = await request(server)
                .post(`${apiRootPath}${tokenRoutesMap.prefix}${tokenRoutesMap["token-get"]}`)
                .send({username: adminUser.username, password: adminUser.password});
            const adminAccessToken = adminResponseToken.body.token;

            let response = await request(server)
                .delete(`${apiRootPath}${routesMap.prefix}${routesMap["post-get-create-update-remove"]}`)
                .set('Authorization', `Bearer ${adminAccessToken}`)
                .send({
                    id: 'INVALID_OBJECTID',
                });
            expect(response.status).toEqual(400);
        });
        it('Admin should get status 200 and true', async () => {
            const adminResponseToken = await request(server)
                .post(`${apiRootPath}${tokenRoutesMap.prefix}${tokenRoutesMap["token-get"]}`)
                .send({username: adminUser.username, password: adminUser.password});
            const adminAccessToken = adminResponseToken.body.token;

            let response = await request(server)
                .delete(`${apiRootPath}${routesMap.prefix}${routesMap["post-get-create-update-remove"]}`)
                .set('Authorization', `Bearer ${adminAccessToken}`)
                .send({
                    id: testPosts[0]._id.toString(),
                });
            expect(response.status).toEqual(200);
            expect(response.body).toBeTruthy();
        });
    });

    describe(`GET ${apiRootPath}${routesMap.prefix}${routesMap.tags}`, () => {
        it('Should produce ITagInfo list', async () => {
            const response = await request(server)
                .get(`${apiRootPath}${routesMap.prefix}${routesMap.tags}`)
                .query({status: 'PUB'});
            expect(response.status).toEqual(200);
            expect(response.body).toHaveProperty('length');
        });
    });

    describe(`GET ${apiRootPath}${routesMap.prefix}${routesMap.sitemap}`, () => {
        it('Should produce ISitemap structure', async () => {
            const response = await request(server)
                .get(`${apiRootPath}${routesMap.prefix}${routesMap.sitemap}`);
            expect(response.status).toEqual(200);
            expect(response.body).toHaveProperty('content');
        });
    });
});
