import sinon from 'sinon';
import {expect} from 'chai';
import Koa from 'koa';
import koaApp from './koa-app';
import mongoose from "mongoose";

before(async function () {
    mongoose.set('useCreateIndex', true);
    mongoose.Promise = global.Promise;
    const connectionResult = await mongoose.connect('mongodb://localhost/jellyblog-2-test', {
        promiseLibrary: global.Promise,
        config: {
            autoIndex: true
        },
        useNewUrlParser: true
    });
    console.info(`Connected to mongodb database ${connectionResult.connection.name}`);
});

after(async function() {
    const disconnected = await mongoose.disconnect();
    console.info('Disconnect from mongodb');
    // debugger;
    return await mongoose.disconnect();
});

afterEach(() => {
    // Sinon:
    // Restore the default sandbox here
    sinon.restore();
});

describe('koa-app.js', function () {
    it('Should export Koa instance', function () {
        expect(koaApp).to.be.an.instanceOf(Koa);
    });
});