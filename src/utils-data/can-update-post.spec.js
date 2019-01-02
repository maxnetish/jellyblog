import {expect} from 'chai';
import sinon from 'sinon';

import {Post} from '../models';

import canUpdatePost from './can-update-post';

describe('can-update-post.js', function () {

    let mapPermissionStub;
    let testPost;

    before(async function () {
        testPost = await Post.create({
            author: 'TestAuthor'
        });
    });

    beforeEach(function () {
        mapPermissionStub = sinon.stub(Post, 'mapPermissions');
    });

    after(async function () {
        return Post.deleteMany({}).exec();
    });

    it('should export function', function () {
        expect(canUpdatePost).to.be.a('function');
    });

    it('should call Post.mapPermissions with expected parameters', async function () {
        mapPermissionStub.returns({
            allowUpdate: false
        });

        const user = {};
        const res = await canUpdatePost({
            user,
            postId: testPost.id
        });

        sinon.assert.calledOnce(mapPermissionStub);

        const withArg = mapPermissionStub.args[0][0];

        expect(withArg.post._id.toString()).to.equal(testPost.id);
        expect(withArg.user).to.equal(user);
    });

    it('should call Post.mapPermissions with expected parameters when pass post object instead of postId', async function () {
        mapPermissionStub.returns({
            allowUpdate: false
        });

        const user = {};
        const res = await canUpdatePost({
            user,
            post: {_id: testPost.id}
        });

        sinon.assert.calledOnce(mapPermissionStub);

        const withArg = mapPermissionStub.args[0][0];

        expect(withArg.post._id.toString()).to.equal(testPost.id);
        expect(withArg.user).to.equal(user);
    });

    it('should return false if Post.mapPermissions allowUpdate: false', async function () {
        mapPermissionStub.returns({
            allowUpdate: false
        });

        const user = {};
        const res = await canUpdatePost({
            user,
            postId: testPost.id
        });

        expect(res).to.equal(false);
    });

    it('should return true if Post.mapPermissions allowUpdate: true', async function () {
        mapPermissionStub.returns({
            allowUpdate: true
        });

        const user = {};
        const res = await canUpdatePost({
            user,
            postId: testPost.id
        });

        expect(res).to.equal(true);
    });

    it('should return true if postId is non existent yet', async function () {
        const user = {};
        const res = await canUpdatePost({
            user,
            // non existent id
            postId: '002cffdf580be6417511bc3a'
        });

        expect(res).to.equal(true);
    });

});