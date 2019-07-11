import mongoose = require('mongoose');
import {Server} from "http";

async function tearDownHttp(server: Server) {
    return new Promise((resolve, reject) => {
        server.close((err) => {
            if (err) {
                reject(err);
            }
            resolve();
        });
    });
}

export async function tearDownHttpAndMongoose(server: Server) {
    await mongoose.connection.close();
    if (server) {
        await tearDownHttp(server);
    }
    return;
}
