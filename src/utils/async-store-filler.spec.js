import {expect} from 'chai';
import sinon from 'sinon';

import {getDefaultFiller} from './async-store-filler';

describe('async-store-filler.js', function () {
    describe('getDefaultFiller', function () {
        it('should export function that return function', function () {
            expect(getDefaultFiller).to.be.a('function');
            expect(getDefaultFiller()).to.be.a('function');
        });
        it('should implement behavior for case 1 or 3: call in server ssr before sync rendering or in client before mount without preloaded state - register store and really fill state for route', async function () {
            const moduleStore = {};
            const storeNamespace = 'testStoreNamespace';
            const storeActionName = 'storeActionName';

            const returnFromDispatch = {};
            const route = {};
            const resources = {};
            const beforeRouteUpdateHook = false;
            const store = {
                state: {},
                registerModule: sinon.spy(),
                dispatch: sinon.spy(async function () {
                    return returnFromDispatch;
                })
            };

            const fillerFn = getDefaultFiller({moduleStore, storeNamespace, storeActionName});
            const fillerResult = await fillerFn({store, route, resources, beforeRouteUpdateHook});

            expect(fillerResult).to.equal(returnFromDispatch);
            sinon.assert.calledWith(store.registerModule, storeNamespace, moduleStore, {preserveState: false});
            sinon.assert.calledWith(store.dispatch, `${storeNamespace}/${storeActionName}`, {route, resources});
        });
        it('should implement behavior for case 1 or 3 without storeNamespace: call in server ssr before sync rendering - really fill state for route', async function () {
            const moduleStore = {};
            const storeActionName = 'storeActionName';

            const returnFromDispatch = {};
            const route = {};
            const resources = {};
            const beforeRouteUpdateHook = false;
            const store = {
                state: {},
                registerModule: sinon.spy(),
                dispatch: sinon.spy(async function () {
                    return returnFromDispatch;
                })
            };

            const fillerFn = getDefaultFiller({moduleStore, storeActionName});
            const fillerResult = await fillerFn({store, route, resources, beforeRouteUpdateHook});

            expect(fillerResult).to.equal(returnFromDispatch);
            sinon.assert.notCalled(store.registerModule);
            sinon.assert.calledWith(store.dispatch, storeActionName, {route, resources});
        });
        it('should implement behavior for case 2: call in browser before mount with preloaded state (hydration) - register store module', async function () {
            const moduleStore = {};
            const storeNamespace = 'testStoreNamespace';
            const storeActionName = 'storeActionName';

            const returnFromDispatch = {};
            const route = {};
            const resources = {};
            const beforeRouteUpdateHook = false;
            const store = {
                state: {
                    // preloaded state
                    [storeNamespace]: {}
                },
                registerModule: sinon.spy(),
                dispatch: sinon.spy(async function () {
                    return returnFromDispatch;
                })
            };

            const fillerFn = getDefaultFiller({moduleStore, storeNamespace, storeActionName});
            const fillerResult = await fillerFn({store, route, resources, beforeRouteUpdateHook});

            // false shows that data didn't really fetched because data already exists in store preloaded state
            expect(fillerResult).to.equal(false);
            // register module store with presering state (else state will become empty)
            sinon.assert.calledWith(store.registerModule, storeNamespace, moduleStore, {preserveState: true});
            sinon.assert.notCalled(store.dispatch);
        });
        it('should implement behavior for case 4: call in client before route update - fill state for route (module store must be already register)', async function () {
            const moduleStore = {};
            const storeNamespace = 'testStoreNamespace';
            const storeActionName = 'storeActionName';

            const returnFromDispatch = {};
            const route = {};
            const resources = {};
            const beforeRouteUpdateHook = true;
            const store = {
                state: {},
                registerModule: sinon.spy(),
                dispatch: sinon.spy(async function () {
                    return returnFromDispatch;
                })
            };

            const fillerFn = getDefaultFiller({moduleStore, storeNamespace, storeActionName});
            const fillerResult = await fillerFn({store, route, resources, beforeRouteUpdateHook});

            expect(fillerResult).to.equal(returnFromDispatch);
            sinon.assert.notCalled(store.registerModule);
            sinon.assert.calledWith(store.dispatch, `${storeNamespace}/${storeActionName}`, {route, resources});
        });
    });
});