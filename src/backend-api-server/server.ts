// @ts-ignore
import mongooseConfig from '../config/mongoose.json';
import mongoose = require('mongoose');
import {app} from "./koa-app";
import dotenv from 'dotenv';

// @ts-ignore
import Koa from 'koa';

// read .env file
const dotenvResult = dotenv.config();

const portToListen = parseInt(process.env.PORT || '3000', 10) || 3000;

async function setupMongo() {
    try {
        // use new createIndex instead of ensureIndex
        mongoose.set('useCreateIndex', true);
        const connectionResult = await mongoose.connect(mongooseConfig.connectionUri, Object.assign(mongooseConfig.connectionOptions, {
            promiseLibrary: global.Promise,
            useNewUrlParser: true,
        }));
        console.info(`Connected to database ${mongooseConfig.connectionUri}`);
        // const migrationResult = await applyDataMigrations({migrations});
        // console.info(migrationResult);
        return connectionResult;
    } catch (err) {
        console.error(`Cannot connect to database ${mongooseConfig.connectionUri}, ${err}`);
        throw err;
    }
}

// Wait for mongoose connection ready...
const promiseForAppRun = setupMongo()
    .then(mongoConnectionResult => {
        return new Promise((resolve, reject) => {
            app.listen(portToListen, () => {
                resolve(app);
            });
        });
    })
    .then((result: Koa) => {
        console.info(`Started and listening on port ${portToListen}. app.env: ${result.env}`);
        return result;
    })
    .then(null, err => {
        console.error('Failed start server.', err);
        throw err;
    });

export default promiseForAppRun;
