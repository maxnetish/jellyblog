import {expect} from 'chai';

import {Post} from '../models';

import updatePostsStatus from './update-posts-status';

describe('update-posts-status.js', function () {

    let postIdsToChange, postIdsToNotChange;

    before(async function () {
        await Post.deleteMany({}).exec();
        const [change1, nochange1, change2, nochange2] = await Post.create([
            {
                author: 'TestAuthor',
                content: 'content 1'
            },
            {
                author: 'TestAuthor',
                content: 'content 2'
            },
            {
                author: 'TestAuthor',
                content: 'content 3'
            },
            {
                author: 'TestAuthor',
                content: 'content 4'
            }
        ]);
        postIdsToChange = [change1.id, change2.id];
        postIdsToNotChange = [nochange1.id, nochange2.id];
    });

    it('should export function', function () {
        expect(updatePostsStatus).to.be.a('function');
    });

    it('should not change posts status if ids is not pass', async function () {
        await updatePostsStatus({status: 'PUB'});
        const posts = await Post.find({status: 'PUB'}).exec();
        expect(posts).to.have.lengthOf(0);
    });

    it('should set status PUB and set pubDate', async function () {
        // make all posts DRAFT
        await updatePostsStatus({status: 'DRAFT', ids: postIdsToChange.concat(postIdsToNotChange)});

        const nowTs = (new Date()).getTime();
        await updatePostsStatus({status: 'PUB', ids: postIdsToChange});
        const pubPosts = await Post.find({status: 'PUB'}).exec();
        expect(pubPosts).to.have.lengthOf(2);
        expect(pubPosts[0].pubDate).to.be.a('date');
        expect(pubPosts[1].pubDate).to.be.a('date');
        expect(pubPosts[0].pubDate.getTime() - nowTs).to.be.below(500);
        expect(pubPosts[1].pubDate.getTime() - nowTs).to.be.below(500);
    });

    it('should set status DRAFT and clear pubDate', async function () {
        // make all posts PUB
        await updatePostsStatus({status: 'PUB', ids: postIdsToChange.concat(postIdsToNotChange)});

        await updatePostsStatus({status: 'DRAFT', ids: postIdsToChange});
        const draftPosts = await Post.find({status: 'DRAFT'}).exec();
        expect(draftPosts).to.have.lengthOf(2);
        expect(draftPosts[0].pubDate).to.be.a('null');
        expect(draftPosts[1].pubDate).to.be.a('null');
    });
});