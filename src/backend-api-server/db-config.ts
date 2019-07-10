import {ConnectionOptions} from "mongoose";

interface IJbDbConfig {
    connectionUri: string,
    connectionOptions: ConnectionOptions,
    paginationDefaultLimit: number,
    commandDump: string,
    dumpFilename: string,
    commandRestore: string
}

function getDbConfig(): IJbDbConfig {
    return {
        connectionUri: process.env.DB_CONNECTION_URI || 'mongodb://localhost/jellyblog',
        connectionOptions: {
            config: {
                autoIndex: true,
            },
            promiseLibrary: Promise,
            useNewUrlParser: true,
        },
        paginationDefaultLimit: parseInt(process.env.DB_DEFAULT_PAGINATION || '10', 10),
        commandDump: process.env.DB_CMD_DUMP || 'mongodump -d jellyblog --quiet --gzip --archive',
        dumpFilename: process.env.DB_DUMP_FILENAME || 'blog.archive.gz',
        commandRestore: process.env.DB_CMD_RESTORE || 'mongorestore --nsFrom jellyblog.* --nsTo jellyblog-check-restore.* --gzip',
    };
}

export {
    getDbConfig
}
