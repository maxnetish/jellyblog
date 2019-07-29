import mongoose = require('mongoose');
import {Server} from "http";
import crypto from "crypto";
import {container} from "../ioc/container";
import {Model} from "mongoose";
import {IUserDocument} from "../auth/api/user-document";
import {TYPES} from "../ioc/types";
import {IUserRefreshTokenDocument} from "../token/api/user-refresh-token-document";
import {IPostAllDetailsPopulatedDocument} from "../post/dto/post-all-details-populated-document";

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

export async function addTestUsers() {
    const UserModel = container.get<Model<IUserDocument>>(TYPES.ModelUser);
    await UserModel.create([
        Object.assign({}, adminUser, {password: textToHash(adminUser.password)}),
        Object.assign({}, readerUser, {password: textToHash(readerUser.password)}),
    ]);
}

export async function clearTestUsers() {
    const UserModel = container.get<Model<IUserDocument>>(TYPES.ModelUser);
    const UserRefreshTokenModel = container.get<Model<IUserRefreshTokenDocument>>(TYPES.ModelRefreshToken);
    await UserModel.deleteMany({
        $or: [
            {username: adminUser.username},
            {username: readerUser.username}
        ]
    }).exec();
    await UserRefreshTokenModel.deleteMany({
        username: {$in: [adminUser.username, readerUser.username]}
    }).exec();
}

export async function clearTestPosts(ids: string[]) {
    const PostModel = container.get<Model<IPostAllDetailsPopulatedDocument>>(TYPES.ModelPost);
    await PostModel.deleteMany({_id: {$in: ids}}).exec();
}
