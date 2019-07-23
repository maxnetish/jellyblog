import mongoose = require('mongoose');
import {Server} from "http";
import crypto from "crypto";

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

export function textToHash(inp: string): string {
    const hash = crypto.createHash('sha256');
    hash.update(inp);
    return hash.digest('hex').toUpperCase();
}

export const adminUser = {
    username: 'testadmin',
    password: 'testsecret',
    role: 'admin'
};

export const readerUser = {
    username: 'testreader',
    password: 'testsecret2',
    role: 'reader'
};
