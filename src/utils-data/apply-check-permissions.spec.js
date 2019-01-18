import {expect} from 'chai';
import sinon from 'sinon';

import applyCheckPermissions from './apply-check-permissions';

describe('apply-check-permissions.js', function () {
    it('should export function', function () {
        expect(applyCheckPermissions).to.be.a('function');
    });
    it('should throw err if don\'t pass resourceFn parameter', function () {
        const invokeWithoutResourceFn = function () {
            return applyCheckPermissions({roles: ['admin']});
        };
        expect(invokeWithoutResourceFn).to.throw();
    });

    describe('passed function resourceFn', function () {
        let resourceFn, decoratedFn, arg1 = {}, arg2 = 'arg2', arg3 = 3, context = {}, returnVal;

        beforeEach(function () {
            resourceFn = sinon.spy();
            decoratedFn = applyCheckPermissions({resourceFn});
            decoratedFn.call(context, arg1, arg2, arg3);
        });

        it('should call once', function () {
            sinon.assert.calledOnce(resourceFn);
        });
        it('should call on current "this"', function () {
            sinon.assert.calledOn(resourceFn, context);
        });
        it('should call with passed arguments', function () {
            sinon.assert.calledWith(resourceFn, arg1, arg2, arg3);
        });
    });

    describe('produced function', function () {
        let resourceFn, decoratedFn;
        const returnVal = {};

        function returnValFn() {
            return returnVal;
        }

        beforeEach(function () {
            resourceFn = sinon.spy(returnValFn);
        });

        it('should return promise rejected with \'405\' if pass {rpcCall:true} and this.xhr not set (resourceFn must calls only "remotely")', function () {
            decoratedFn = applyCheckPermissions({
                rpcCall: true,
                resourceFn
            });

            return decoratedFn.call({})
                .then(function () {
                    sinon.assert.fail('Decorated didn\'t have to resolve');
                })
                .then(null, function (err) {
                    sinon.assert.notCalled(resourceFn);
                    expect(err.status).to.equal(405);
                });
        });
        it('should return promise rejected with \'403\' if pass {directCall:true} and this.xhr setted (resourceFn must calls only "locally")', function () {
            decoratedFn = applyCheckPermissions({
                directCall: true,
                resourceFn
            });

            return decoratedFn.call({
                xhr: true
            })
                .then(function () {
                    sinon.assert.fail('Decorated didn\'t have to resolve');
                })
                .then(null, function (err) {
                    sinon.assert.notCalled(resourceFn);
                    expect(err.status).to.equal(403);
                });
        });
        it('should return promise rejected with \'401\' if pass non-empty {roles: []} and this.user not set', function () {
            decoratedFn = applyCheckPermissions({
                roles: ['foo', 'bar', 'another'],
                resourceFn
            });

            return decoratedFn.call({})
                .then(function () {
                    sinon.assert.fail('Decorated didn\'t have to resolve');
                })
                .then(null, function (err) {
                    sinon.assert.notCalled(resourceFn);
                    expect(err.status).to.equal(401);
                });
        });
        it('should return promise rejected with \'401\' if pass non-empty {roles: []} and this.user.role is not set', function () {
            decoratedFn = applyCheckPermissions({
                roles: ['foo', 'bar', 'another'],
                resourceFn
            });

            return decoratedFn.call({
                user: {}
            })
                .then(function () {
                    sinon.assert.fail('Decorated didn\'t have to resolve');
                })
                .then(null, function (err) {
                    sinon.assert.notCalled(resourceFn);
                    expect(err.status).to.equal(401);
                });
        });
        it('should return promise rejected with \'401\' if pass non-empty {roles: []} and this.user.role is not one of permitted {roles: []}', function () {
            decoratedFn = applyCheckPermissions({
                roles: ['foo', 'bar', 'another'],
                resourceFn
            });

            return decoratedFn.call({
                user: {
                    role: 'foobar'
                }
            })
                .then(function () {
                    sinon.assert.fail('Decorated didn\'t have to resolve');
                })
                .then(null, function (err) {
                    sinon.assert.notCalled(resourceFn);
                    expect(err.status).to.equal(401);
                });
        });
        it('should return value from decorated function if if pass {rpcCall:true} and this.xhr is set (resourceFn must calls only "remotely")', function () {
            decoratedFn = applyCheckPermissions({
                rpcCall: true,
                resourceFn
            });

            expect(decoratedFn.call({xhr: true})).to.equal(returnVal);
            sinon.assert.calledOnce(resourceFn);
        });
        it('should return value from decorated function if if pass {directCall:true} and this.xhr is not set (resourceFn must calls only "locally")', function () {
            decoratedFn = applyCheckPermissions({
                directCall: true,
                resourceFn
            });

            expect(decoratedFn.call({xhr: false})).to.equal(returnVal);
            sinon.assert.calledOnce(resourceFn);
        });
        it('should return value from decorated function if pass empty {roles: []}', function () {
            decoratedFn = applyCheckPermissions({
                roles: [],
                directCall: true,
                resourceFn
            });

            expect(decoratedFn.call({
                user: {
                    role: 'foobar'
                },
                xhr: false
            })).to.equal(returnVal);
            sinon.assert.calledOnce(resourceFn);
        });
        it('should return value from decorated function if pass none-empty {roles: []} and this.user.role one of permitted {roles: []}', function () {
            decoratedFn = applyCheckPermissions({
                roles: ['foo', 'bar', 'another'],
                rpcCall: true,
                resourceFn
            });

            expect(decoratedFn.call({
                user: {
                    role: 'bar'
                },
                xhr: true
            })).to.equal(returnVal);
            sinon.assert.calledOnce(resourceFn);
        });
    });
});
