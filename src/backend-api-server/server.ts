import 'reflect-metadata';
import {Server} from "http";
import {container} from "./ioc/container";
import {runServer} from "./server-up";

// We have to resolve Server because Server use in integral testing
export const promiseForAppRun: Promise<Server> = runServer(container);

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
