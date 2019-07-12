import mongoose = require('mongoose');
import {createApp} from "./koa-app";
import dotenv from 'dotenv';
import {getDbConfig} from "./db-config";
import {Server} from "http";

// read .env file
const dotenvResult = dotenv.config();

async function setupMongo() {
    const dbConfig = getDbConfig();
    try {
        // use new createIndex instead of ensureIndex
        mongoose.set('useCreateIndex', true);
        const connectionResult = await mongoose.connect(dbConfig.connectionUri, dbConfig.connectionOptions);
        console.info(`Connected to database ${dbConfig.connectionUri}`);
        // TODO rewrite migrations
        // const migrationResult = await applyDataMigrations({migrations});
        // console.info(migrationResult);
        return connectionResult;
    } catch (err) {
        console.error(`Cannot connect to database ${dbConfig.connectionUri}, ${err}`);
        throw err;
    }
}

const portToListen = parseInt(process.env.PORT || '3000', 10) || 3000;

// Wait for mongoose connection ready...
const promiseForAppRun: Promise<Server> = setupMongo()
    .then(mongoConnectionResult => {
        const app = createApp();
        return new Promise((resolve, reject) => {
            const httpServer = app.listen(portToListen, () => {
                console.info(`Started and listening on port ${portToListen}. app.env: ${app.env}`);
                resolve(httpServer);
            });
        });
    })
    .then(null, err => {
        console.error('Failed start server.', err);
        throw err;
    });

export default promiseForAppRun;

/**
 * config parameters moved from json to environment
 * Example of .env file (place near server.js)
 *
 PORT=3000
 CORS_ORIGIN=http://localhost:4200
 DB_DEFAULT_PAGINATION=10
 DB_CONNECTION_URI=mongodb://localhost/jellyblog
 DB_CMD_DUMP=mongodump -d jellyblog --quiet --gzip --archive
 DB_DUMP_FILENAME=blog.archive.gze
 DB_CMD_RESTORE=mongorestore --nsFrom jellyblog.* --nsTo jellyblog-check-restore.* --gzip
 JWT_SECRET=Top secret
 JWT_EXPIRES_IN=2h
 JWT_AUDIENCE=MYBLOG
 JWT_ISSUER=localhost
 JWT_REFRESH_TOKEN_EXPIRES_IN_DAYS=30
 JWT_REFRESH_TOKEN_COOKIE=jb-refresh-token
 DEFAULT_ADMIN_PASSWORD=changeimmediately
 ROUTE_API_PATH=api
 */
