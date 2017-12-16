import {Migration, Post} from '../models';
import migrDescriptors from '../mirgations';
import {sortBy, some} from 'lodash';



function migrationPromiseFactory(migrationDescriptor) {
    return Promise.resolve(migrationDescriptor.promiseMigration())
        .then(successResult => {
            let status = 'SUCCESS';
            Migration.create({
                key: migrationDescriptor.key,
                tryResult: status,
                tryDate: new Date(),
                tryDetails: successResult
            });
            return status;
        })
        .then(null, errResult => {
            let status = 'FAILS';
            Migration.create({
                key: migrationDescriptor.key,
                tryResult: status,
                tryDate: new Date(),
                tryDetails: errResult
            });
            return status;
        });
}

function apply() {
    let migrationPromises = [];
    let sortedMigrDescriptors = sortBy(migrDescriptors, 'key');

    return Migration.find({
        tryResult: 'SUCCESS'
    })
        .then(alreadyDoneMigrations => {
            sortedMigrDescriptors.forEach(descr => {
                 if(some(alreadyDoneMigrations, {key: descr.key})) {
                     // MIgration already successfully done, skip it
                     return;
                 }
                 // add to promises...
                migrationPromises.push(migrationPromiseFactory(descr));
            });
            return Promise.all(migrationPromises);
        })
        .then(migrationsAllResult => {
            if(migrationsAllResult.indexOf('FAILS') > -1) {
                throw 'One or more migration jobs failed. See Migration collection for details.';
            }
            if(migrationsAllResult.length) {
                return `Successfully done ${migrationsAllResult.length} migration job(s).`;
            }
            return 'There is no planned mirgation jobs';
        });
}

export default apply;
