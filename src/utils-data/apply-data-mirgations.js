import {Migration} from '../models';
import {sortBy, some, isArray} from 'lodash';


function migrationPromiseFactory(migrationDescriptor) {
    return Promise.resolve(migrationDescriptor.promiseMigration())
        .then(successResult => {
            return {
                key: migrationDescriptor.key,
                tryResult: 'SUCCESS',
                tryDate: new Date(),
                tryDetails: successResult
            };
        })
        .then(null, errResult => {
            return {
                key: migrationDescriptor.key,
                tryResult: 'FAILS',
                tryDate: new Date(),
                tryDetails: errResult
            };
        })
        .then(modelToStore => {
            return Migration.create(modelToStore);
        });
}

function apply({migrations}) {
    let migrationPromises = [];
    let sortedMigrationDescriptors = sortBy(isArray(migrations) ? migrations : [migrations], 'key');

    return Migration.find({
        tryResult: 'SUCCESS'
    })
        .then(alreadyDoneMigrations => {
            sortedMigrationDescriptors.forEach(descr => {
                if (some(alreadyDoneMigrations, {key: descr.key})) {
                    // MIgration already successfully done, skip it
                    return;
                }
                // add to promises...
                migrationPromises.push(migrationPromiseFactory(descr));
            });
            return Promise.all(migrationPromises);
        })
        .then(migrationsAllResult => {
            if (migrationsAllResult.findIndex(m => m.tryResult === 'FAILS') > -1) {
                throw 'One or more migration jobs failed. See Migration collection for details.';
            }
            if (migrationsAllResult.length) {
                return `Successfully done ${migrationsAllResult.length} migration job(s).`;
            }
            return 'There is no planned mirgation jobs';
        });
}

export default apply;
