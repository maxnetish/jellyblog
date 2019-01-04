import {expect} from 'chai';
import mockSpawn from 'mock-spawn';
import sinon from 'sinon';
import * as childProcess from 'child_process';
import {Readable} from 'stream';

import {dump, restore} from './db-maintenance';

describe('db-maintenance.js', function () {

    let spawn;
    let childProcessSpawnStub;

    beforeEach(function () {
        spawn = mockSpawn(false);
        // not very good stub, but... works
        childProcessSpawnStub = sinon.stub(childProcess, 'spawn');
        childProcessSpawnStub.callsFake(spawn);
    });

    describe('dump', function () {

        it('should export function', function () {
            expect(dump).to.be.a('function');
        });
        it('should fail if commandDump is not provided', function () {
            expect(function () {
                dump();
            }).to.throw();
        });
        it('should call child process spawn with provided parameters and return stream', function () {
            const mongoConfig = {
                commandDump: 'fakecommand param1 param2'
            };
            const result = dump(mongoConfig);
            expect(result).to.be.an.instanceof(Readable);
            expect(spawn.calls.length).to.equal(1);
            expect(`${spawn.calls[0].command} ${spawn.calls[0].args[0]} ${spawn.calls[0].args[1]}`).to.equal(mongoConfig.commandDump);
        });
        it('should throw exception if spawn throws err ', function () {
            const mongoConfig = {
                commandDump: 'fakecommand param1 param2'
            };
            childProcessSpawnStub.throws();
            expect(function () {
                dump(mongoConfig);
            }).to.throw();
        });
    });

    describe('restore', function () {
        it('should export function', function () {
            expect(restore).to.be.a('function');
        });
        it('should reject if parameters not provided', async function () {
            try {
                const result = await restore();
                expect(true).to.equal(false, 'expect throw exception');
            } catch (err) {
                expect(err).to.be.an.instanceof(Error);
            }
        });
        it('should call child process spawn with provided parameters and resolves to...', async function () {
            const mongoConfig = {
                commandRestore: 'fakecommand param1 param2'
            };
            const pathInfo = {path: 'fake/path'};
            const result = await restore(pathInfo, mongoConfig);
            expect(result.code).to.equal(0);
            expect(result).has.property('signal');
            expect(result).has.property('stdout');
            expect(result).has.property('stderr');
            expect(spawn.calls.length).to.equal(1);
            expect(`${spawn.calls[0].command} ${spawn.calls[0].args[0]} ${spawn.calls[0].args[1]}`).to.equal(mongoConfig.commandRestore);
            expect(spawn.calls[0].args[2]).to.equal(`--archive=${pathInfo.path}`, 'expected that 3th arg will be name of file with db dump');
        });
        it('should reject if spawn throws err ', async function () {
            const mongoConfig = {
                commandRestore: 'fakecommand param1 param2'
            };
            childProcessSpawnStub.throws();
            try {
                const result = await restore(pathInfo, mongoConfig);
                expect(true).to.equal(false, 'expect throw exception');
            }
            catch (err) {
                expect(err).to.be.an.instanceof(Error);
            }
        });
    });
});