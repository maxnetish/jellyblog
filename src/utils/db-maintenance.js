import {spawn} from 'child_process';
import mongooseConfig from '../../config/mongoose.json';

function dump(req, res, next) {
    let commandWithArgs = mongooseConfig.commandDump;

    if (!commandWithArgs) {
        res.status(204).end();
        return;
    }

    // let command = mongooseConfig.commandDump;
    let commandParts = commandWithArgs.split(' ');
    let command = commandParts.shift();
    let args = commandParts;
    let filename = 'blog.archive';

    try {
        let dumpProcess = spawn(command, args);
        let readStream = dumpProcess.stdout;

        dumpProcess.once('error', procErr => {
            console.log('Proc error', procErr);
            readStream.unpipe(res);
            res.end(JSON.stringify(procErr));
        });

        readStream.once('end', e => {
            console.log('End stream event', e);
        });

        readStream.once('close', e => {
            console.log('Close event', e);
        });

        res.set({
            'Content-type': 'application/octet-stream',
            'Content-Disposition': `attachment; filename="${filename}"`
        });
        readStream.pipe(res);
    }
    catch (err) {
        // next(err);
        readStream.unpipe(res);
        res.end(JSON.stringify(err));
    }
}

function restore() {

}

export {
    dump,
    restore
};