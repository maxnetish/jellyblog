import app from './koa-app';
import mongoose from "mongoose";
import mongooseConfig from "../config/mongoose";
import applyDataMigrations from "./utils-data/apply-data-mirgations";
import appConfig from "../config/app";
import migrations from './mirgations';

async function setupMongo() {
    try {
        // use new createIndex instead of ensureIndex
        mongoose.set('useCreateIndex', true);
        mongoose.Promise = global.Promise;
        const connectionResult = await mongoose.connect(mongooseConfig.connectionUri, Object.assign(mongooseConfig.connectionOptions, {
            promiseLibrary: global.Promise
        }));
        console.info(`Connected to database ${mongooseConfig.connectionUri}`);
        const migrationResult = await applyDataMigrations({migrations});
        console.info(migrationResult);
        return connectionResult;
    }
    catch (err) {
        console.error(`Cannot connect to database ${mongooseConfig.connectionUri}, ${err}`);
        throw err;
    }
}

const portToListen = process.env.PORT || appConfig.port || 3000;

// Wait for mongoose connection ready...
const promiseForAppRun = setupMongo()
    .then(mongoConnectionResult => {
        return new Promise((resolve, reject) => {
            app.listen(portToListen, (err, ...others) => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve(app);
            });
        });
    })
    .then((result) => {
        console.info(`Started and listening on port ${portToListen}. app.env: ${result.env}`);
        return result;
    })
    .then(null, err => {
        console.error('Failed start server.', err);
        throw err;
    });

export default promiseForAppRun;