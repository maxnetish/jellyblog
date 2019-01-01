import sinon from 'sinon';
import {expect} from 'chai';
import waitForServerRun from './server';

afterEach(() => {
    // Sinon:
    // Restore the default sandbox here
    sinon.restore();
});

describe('server.js', function () {
    it('Should export promise', function () {
        expect(waitForServerRun).to.be.a('promise');
    });
    it('Can up and run', async function () {
        const app = await waitForServerRun;
        expect(app).to.be.an('object');
    });
});