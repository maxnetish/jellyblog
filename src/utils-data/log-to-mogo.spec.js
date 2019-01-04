import {expect} from 'chai';

import http from 'http';
import morgan from 'morgan'; // dependency of koa-morgan
import request from 'supertest';
import util from 'util';

import {Log} from '../models';
import {addEntryFromErrorResponse, addEntryFromMorgan} from './log-to-mongo';

const setTimeoutPromise = util.promisify(setTimeout);

describe('log-to-mongo.js', function () {

    describe('addEntryFromErrorResponse', function(){

        it('should export function', function(){
            expect(addEntryFromErrorResponse).to.be.a('function');
        });
        it('should add mongo doc to Log collection', async function() {
            const fakeReq = {
                url: `/foo-${(new Date()).getTime()}`,
                method: 'GET'
            };
            const fakeErr = {
                message: 'test error',
                stack: 'test stack'
            };

            await addEntryFromErrorResponse(fakeReq, {}, fakeErr);

            const recentlyEnties = await Log
                .find()
                .sort({'_id': -1})
                .limit(2)
                .exec();

            expect(recentlyEnties).to.be.an('array').have.lengthOf.at.least(1);
            expect(recentlyEnties[0].requestUrl).to.equal(fakeReq.url);
            expect(recentlyEnties[0].requestMethod).to.equal(fakeReq.method);
            expect(recentlyEnties[0].error).to.have.string(fakeErr.message);
            expect(recentlyEnties[0].error).to.have.string(fakeErr.stack);
        });
    });

    describe('addEntryFromMorgan', function () {

        // format is actually addEntryFromMorgan
        function createServerForMorganMiddleware(funcToTest, opts, fn, fn1) {
            return http.createServer()
                .on('request', createRequestListenerForMorganMiddleware(funcToTest, opts, fn, fn1))
        }

        function noopMiddleware(req, res, next) {
            next();
        }

        // helper function to mock morgan middleware - See test in https://github.com/expressjs/morgan
        function createRequestListenerForMorganMiddleware(format, opts, fn, fn1) {
            const logger = morgan(format, opts);
            const middle = fn || noopMiddleware;

            return function onRequest(req, res) {
                // prior alterations
                if (fn1) {
                    fn1(req, res)
                }

                logger(req, res, function onNext(err) {
                    // allow req, res alterations
                    middle(req, res, function onDone() {
                        if (err) {
                            res.statusCode = 500;
                            res.end(err.message);
                        }

                        res.setHeader('X-Sent', 'true');
                        res.end((req.connection && req.connection.remoteAddress) || '-');
                    });
                });
            };
        }

        before(function () {
            // return Log.deleteMany({}).exec();
        });

        it('should export function', function () {
            expect(addEntryFromMorgan).to.be.a('function');
        });
        it('should add mongo doc to Log collection on http request', async function () {
            const uniqUrl = `/foo-${(new Date()).getTime()}`;
            const res = await request(createServerForMorganMiddleware(addEntryFromMorgan))
                .get(uniqUrl)
                .expect(200);

            // addEntryFromMorgan should run async creating mongodb doc but must return sync
            // so we wait some time before check new record
            await setTimeoutPromise(200, res);

            const recentlyEnties = await Log
                .find()
                .sort({'_id': -1})
                .limit(2)
                .exec();

            expect(recentlyEnties).to.be.an('array').have.lengthOf.at.least(1);
            expect(recentlyEnties[0].requestUrl).to.equal(uniqUrl);
        });

    });
});