import {expect} from 'chai';
import sinon from 'sinon';

import {Migration} from '../models';

import applyDataMigrations from './apply-data-mirgations';
import migrations from "../mirgations";


describe('apply-data-migrations.js', function () {

    before(async function(){
        return Migration.deleteMany({}).exec();
    });

    it('should export function', function () {
        expect(applyDataMigrations).to.be.a('function');
    });
    it('should fail if not pass migration descriptors', function () {
        expect(function () {
            return applyDataMigrations();
        }).to.throw(TypeError);
    });

    it('should exec descriptor#promiseMigration and return status string', async function () {
        const migrationsToDo = [
            {
                key: 10,
                promiseMigration: sinon.spy(async function () {
                    return 'test 1 done';
                })
            },
            {
                key: 20,
                promiseMigration: sinon.spy(async function () {
                    return 'test 2 done';
                })
            }
        ];
        const spies = migrationsToDo.map(m => m.promiseMigration);
        const keys = migrationsToDo.map(m => m.key);

        const result = await applyDataMigrations({migrations: migrationsToDo});

       spies.forEach(s => {
           sinon.assert.calledOnce(s);
       });
       expect(result).to.be.a('string');
    });

    it('should exec only descriptor#promiseMigration that not execs before', async function() {
        const migrationDoneBefore = [
            {
                key: 30,
                promiseMigration: async function () {
                    return 'test 3 done';
                }
            }
        ];
        const migrationToDo = [
            {
                key: 30,
                promiseMigration: sinon.spy(async function () {
                    return 'test 3 done';
                })
            },
            {
                key: 40,
                promiseMigration: sinon.spy(async function () {
                    return 'test 4 done';
                })
            }
        ];

        // do migration
        await applyDataMigrations({migrations: migrationDoneBefore});

        // run "new" migrations
        await applyDataMigrations({migrations: migrationToDo});

        const spies = migrationToDo.map(m => m.promiseMigration);

        // first migration "already" done, should not exec another time
        // Only second migration have to be really done
        sinon.assert.notCalled(spies[0]);
        sinon.assert.calledOnce(spies[1]);
    });

    it('should throw if descriptor#promiseMigration fails', async function(){
        const migrationFails = [
            {
                key: 50,
                promiseMigration: async function () {
                    return Promise.reject('Reject to test');
                }
            }
        ];
        let res;

        try {
            res = await applyDataMigrations({migrations: migrationFails});
        } catch (err) {
            res = {rejectedMigrations: err};
        }
        expect(res).to.have.property('rejectedMigrations').that.is.a('string');
    });

    it('should exec descriptor#promiseMigration if previous try fails', async function(){
        const migrationFails = [
            {
                key: 50,
                promiseMigration: async function () {
                    return Promise.reject('Reject to test');
                }
            }
        ];
        const migrationSuccess = [
            {
                key: 50,
                promiseMigration: sinon.spy(async function () {
                    return 'Success try';
                })
            }
        ];

        try {
            await applyDataMigrations({migrations: migrationFails});
        } catch (err) {
            // ignore throwing error
        }

        const res = await applyDataMigrations({migrations: migrationSuccess});

        sinon.assert.calledOnce(migrationSuccess[0].promiseMigration);
    });

});