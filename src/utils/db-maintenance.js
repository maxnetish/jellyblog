import {spawn} from 'child_process';
import mongooseConfig from '../../config/mongoose.json';
import multer from "multer";

function onDumpError({err = null, res, readStream} = {}) {
    console.error('Dump child process error: ', err);
    if (readStream) {
        // unbind streams
        readStream.unpipe(res);
    }
    if (res.headersSent) {
        // Headers already sent to client, so end response as is...
        // Send error message in the end of the body: this all that we can
        res.end(JSON.stringify(err));
    } else {
        // We can set status
        clearHeaders(res);
        res.status(500);
        res.json(err);
    }
}

function clearHeaders(res) {
    let headerNames = res.getHeaderNames();
    headerNames.forEach(headerName => res.removeHeader(headerName));
}

function streamToString(stream) {
    if(!stream) {
        return null;
    }
    let buf = stream.read();
    if(!buf) {
        return null;
    }
    return buf.toString();
}

function dump(req, res, next) {
    let commandWithArgs = mongooseConfig.commandDump;

    if (!commandWithArgs) {
        res.status(204).end();
        return;
    }

    let commandParts = commandWithArgs.split(' ');
    let command = commandParts.shift();
    let args = commandParts;
    let filename = mongooseConfig.dumpFilename || 'db.dump';
    let readStream;

    try {
        let dumpProcess = spawn(command, args);
        readStream = dumpProcess.stdout;

        dumpProcess.once('error', procErr => onDumpError({res, readStream, err: procErr}));

        res.set({
            'Content-type': 'application/octet-stream',
            'Content-Disposition': `attachment; filename="${filename}"`
        });
        readStream.pipe(res);
    }
    catch (err) {
        onDumpError({res, readStream, err})
    }
}

function restore({path}) {
    let commandWithArgs = mongooseConfig.commandRestore;

    return new Promise((resolve, reject) => {
        if (!commandWithArgs) {
            reject(new Error(204));
            return;
        }
        let commandParts = commandWithArgs.split(' ');
        let command = commandParts.shift();
        let args = commandParts;

        args.push(`--archive=${path}`);

        try {
            let restoreProcess = spawn(command, args);

            restoreProcess.once('error', procErr => {
                reject(procErr);
            });

            restoreProcess.once('exit', (code, signal) => {
                let stdout = restoreProcess.stdout;
                let stderr = restoreProcess.stderr;
                resolve({
                    code,
                    signal,
                    stdout: streamToString(stdout),
                    stderr: streamToString(stderr)
                });
            });

        }
        catch (err) {
            reject(err);
        }
    });


}

const uploadDumpMiddleware = multer({
    storage: multer.diskStorage({}),
    fileFilter: (req, file, cb) => {
        if (!(req.user && req.user.role === 'admin')) {
            cb(null, false);
            return;
        }
        cb(null, true);
    },
    limits: {
        fields: 8,
        fileSize: 2147483648,
        files: 1
    }
});

export {
    dump,
    uploadDumpMiddleware,
    restore
};