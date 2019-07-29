import {Server} from "http";
import {promiseForAppRun} from "../../server";
import {
    addTestUsers,
    adminUser, clearTestPosts,
    clearTestUsers,
    readerUser,
    tearDownHttpAndMongoose,
} from "../../test/utils";
import {routesMap} from "./post-routes-map";
import request from 'supertest';
import {routesMap as tokenRoutesMap} from "../../token/koa-routes/token-routes-map";
import {mongoObjectIdSchema} from "../../utils/dto/mongo-object-id.schema";
import {postStatusSchema} from "../dto/post-status.schema";
import {postAllowReadSchema} from "../dto/post-allow-read.schema";
import Joi from "@hapi/joi";
import {postContentTypeSchema} from "../dto/post-content-type.schema";
import {postContentSchema, postHruSchema, postTagSchema, postTitleSchema} from "../dto/post-common.schema";

let server: Server;
const postIdsToClearAfterTest: string[] = [];

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
    await clearTestPosts(postIdsToClearAfterTest);
    await clearTestUsers();
    await tearDownHttpAndMongoose(server);
});

describe(`Routes api${routesMap.prefix}`, () => {
    describe(`POST api${routesMap.prefix}${routesMap["post-get-create-update-remove"]}`, () => {

        it('With invalid parameters should produce status 400', async () => {
            let response = await request(server)
                .post(`/api${routesMap.prefix}${routesMap["post-get-create-update-remove"]}`)
                .send({
                    status: 'FOO'
                });
            expect(response.status).toEqual(400);

            response = await request(server)
                .post(`/api${routesMap.prefix}${routesMap["post-get-create-update-remove"]}`)
                .send({
                    status: 'DRAFT',
                    title: 'INVALID REQUEST'
                });
            expect(response.status).toEqual(400);

            response = await request(server)
                .post(`/api${routesMap.prefix}${routesMap["post-get-create-update-remove"]}`)
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
                .post(`/api${routesMap.prefix}${routesMap["post-get-create-update-remove"]}`);
            expect(response.status).toEqual(400);
        });

        it('With not admin user should produce status 401', async () => {
            const readerResponseToken = await request(server)
                .post(`/api${tokenRoutesMap.prefix}${tokenRoutesMap["token-get"]}`)
                .send({username: readerUser.username, password: readerUser.password});
            const readerAccessToken = readerResponseToken.body.token;

            const response = await request(server)
                .post(`/api${routesMap.prefix}${routesMap["post-get-create-update-remove"]}`)
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
                .post(`/api${routesMap.prefix}${routesMap["post-get-create-update-remove"]}`)
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
                .post(`/api${tokenRoutesMap.prefix}${tokenRoutesMap["token-get"]}`)
                .send({username: adminUser.username, password: adminUser.password});
            const adminAccessToken = adminResponseToken.body.token;

            const response = await request(server)
                .post(`/api${routesMap.prefix}${routesMap["post-get-create-update-remove"]}`)
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

    describe(`PUT api${routesMap["post-get-create-update-remove"]}`, () => {
        it('With invalid parameters should produce status 400', async () => {
            let response = await request(server)
                .put(`/api${routesMap.prefix}${routesMap["post-get-create-update-remove"]}`)
                .send({
                    status: 'FOO'
                });
            expect(response.status).toEqual(400);

            response = await request(server)
                .put(`/api${routesMap.prefix}${routesMap["post-get-create-update-remove"]}`)
                .send({
                    status: 'DRAFT',
                    title: 'INVALID REQUEST'
                });
            expect(response.status).toEqual(400);

            response = await request(server)
                .put(`/api${routesMap.prefix}${routesMap["post-get-create-update-remove"]}`)
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
                .put(`/api${routesMap.prefix}${routesMap["post-get-create-update-remove"]}`);
            expect(response.status).toEqual(400);
        });

        it('Update with not existent post should produce status 400', async () => {
            const adminResponseToken = await request(server)
                .post(`/api${tokenRoutesMap.prefix}${tokenRoutesMap["token-get"]}`)
                .send({username: adminUser.username, password: adminUser.password});
            const adminAccessToken = adminResponseToken.body.token;

            let response = await request(server)
                .put(`/api${routesMap.prefix}${routesMap["post-get-create-update-remove"]}`)
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
                .post(`/api${tokenRoutesMap.prefix}${tokenRoutesMap["token-get"]}`)
                .send({username: readerUser.username, password: readerUser.password});
            const readerAccessToken = readerResponseToken.body.token;

            let response = await request(server)
                .put(`/api${routesMap.prefix}${routesMap["post-get-create-update-remove"]}`)
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
                .put(`/api${routesMap.prefix}${routesMap["post-get-create-update-remove"]}`)
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
                .post(`/api${tokenRoutesMap.prefix}${tokenRoutesMap["token-get"]}`)
                .send({username: adminUser.username, password: adminUser.password});
            const adminAccessToken = adminResponseToken.body.token;

            // first create post
            const responseCreate = await request(server)
                .post(`/api${routesMap.prefix}${routesMap["post-get-create-update-remove"]}`)
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
                .put(`/api${routesMap.prefix}${routesMap["post-get-create-update-remove"]}`)
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

    describe(`POST api${routesMap.prefix}${routesMap.export}`, () => {
        it('With invalid paramepers should produce status 400', async () => {
            let response = await request(server)
                .post(`/api${routesMap.prefix}${routesMap.export}`)
                .send({
                    status: 'FOO'
                });
            expect(response.status).toEqual(400);

            response = await request(server)
                .post(`/api${routesMap.prefix}${routesMap.export}`)
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
                .post(`/api${routesMap.prefix}${routesMap.export}`);
            expect(response.status).toEqual(400);
        });

        it('With non admin user should produce status 401', async () => {
            const readerResponseToken = await request(server)
                .post(`/api${tokenRoutesMap.prefix}${tokenRoutesMap["token-get"]}`)
                .send({username: readerUser.username, password: readerUser.password});
            const readerAccessToken = readerResponseToken.body.token;

            let response = await request(server)
                .post(`/api${routesMap.prefix}${routesMap.export}`)
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
                .post(`/api${routesMap.prefix}${routesMap.export}`)
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
                .post(`/api${tokenRoutesMap.prefix}${tokenRoutesMap["token-get"]}`)
                .send({username: adminUser.username, password: adminUser.password});
            const adminAccessToken = adminResponseToken.body.token;

            postIdsToClearAfterTest.push('2cb051abd01f7f4c804f993a', '2cb051abd01f7f4c804f993b', '2cb051abd01f7f4c804f993c');
            let response = await request(server)
                .post(`/api${routesMap.prefix}${routesMap.export}`)
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

    describe(`GET api${routesMap.prefix}${routesMap["post-get-create-update-remove"]}`, () => {
        it('With not admin user should produce status 401', async () => {
            const readerResponseToken = await request(server)
                .post(`/api${tokenRoutesMap.prefix}${tokenRoutesMap["token-get"]}`)
                .send({username: readerUser.username, password: readerUser.password});
            const readerAccessToken = readerResponseToken.body.token;

            let response = await request(server)
                .get(`/api${routesMap.prefix}${routesMap["post-get-create-update-remove"]}`)
                .set('Authorization', `Bearer ${readerAccessToken}`)
                .query({id: '2cb051abd01f7f4c804f993a'});
            expect(response.status).toEqual(401);
        });

        it('With anon user should produce status 403', async () => {
            let response = await request(server)
                .get(`/api${routesMap.prefix}${routesMap["post-get-create-update-remove"]}`)
                .query({id: '2cb051abd01f7f4c804f993a'});
            expect(response.status).toEqual(403);
        });

        it('With invalid parameter should produce status 400', async () => {
            const adminResponseToken = await request(server)
                .post(`/api${tokenRoutesMap.prefix}${tokenRoutesMap["token-get"]}`)
                .send({username: adminUser.username, password: adminUser.password});
            const adminAccessToken = adminResponseToken.body.token;

            let response = await request(server)
                .get(`/api${routesMap.prefix}${routesMap["post-get-create-update-remove"]}`)
                .set('Authorization', `Bearer ${adminAccessToken}`)
                .query({id: '2cb051abd01f7f4c804f993a', unexpected: 'FOO'});
            expect(response.status).toEqual(400);

            response = await request(server)
                .get(`/api${routesMap.prefix}${routesMap["post-get-create-update-remove"]}`)
                .set('Authorization', `Bearer ${adminAccessToken}`)
                .query({id: 'INVALID-OBJECTID'});
            expect(response.status).toEqual(400);

            response = await request(server)
                .get(`/api${routesMap.prefix}${routesMap["post-get-create-update-remove"]}`)
                .set('Authorization', `Bearer ${adminAccessToken}`);
            expect(response.status).toEqual(400);
        });

        it('If post not found should produce status 404', async () => {
            const adminResponseToken = await request(server)
                .post(`/api${tokenRoutesMap.prefix}${tokenRoutesMap["token-get"]}`)
                .send({username: adminUser.username, password: adminUser.password});
            const adminAccessToken = adminResponseToken.body.token;

            let response = await request(server)
                .get(`/api${routesMap.prefix}${routesMap["post-get-create-update-remove"]}`)
                .set('Authorization', `Bearer ${adminAccessToken}`)
                .query({id: '2cb051abd01f7f4c80000000'});
            expect(response.status).toEqual(404);
        });

        it('Valid id and admin user - we should get status 200 and IPostAllDetails', async () => {
            const adminResponseToken = await request(server)
                .post(`/api${tokenRoutesMap.prefix}${tokenRoutesMap["token-get"]}`)
                .send({username: adminUser.username, password: adminUser.password});
            const adminAccessToken = adminResponseToken.body.token;

            let response = await request(server)
                .get(`/api${routesMap.prefix}${routesMap["post-get-create-update-remove"]}`)
                .set('Authorization', `Bearer ${adminAccessToken}`)
                .query({id: '2cb051abd01f7f4c804f993a'});
            expect(response.status).toEqual(200);
            expect(response.body._id).toEqual('2cb051abd01f7f4c804f993a');
            expect(response.body.author).toEqual(adminUser.username);
        });
    });
});
