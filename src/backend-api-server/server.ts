import 'reflect-metadata';
import dotenv from 'dotenv';
import {Server} from "http";
import {IAppBuilder} from "./app-builder";
import {container} from "./ioc/container";
import {TYPES} from "./ioc/types";

async function runServer(): Promise<Server> {

    // read .env file
    const dotenvResult = dotenv.config();
    const portToListen = parseInt(process.env.PORT || '3000', 10) || 3000;
    const appBuilder = container.get<IAppBuilder>(TYPES.AppBuilder);
    const app = await appBuilder.createApp();

    return new Promise((resolve, reject) => {
        const httpServer = app.listen(portToListen, () => {
            console.info(`Started and listening on port ${portToListen}. app.env: ${app.env}`);
            resolve(httpServer);
        });
    })
        .then(null, err => {
            console.error('Failed start server.', err);
            throw err;
        });
}

// We have to resolve Server because Server use in integral testing
export const promiseForAppRun: Promise<Server> = runServer();

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
 JB_GRIDFS_BASEURL=/file
 JB_POST_BASEURL=/post
 JB_TAG_BASEURL=/tag
 JB_HOST_URL=http://localhost:3000
 */
