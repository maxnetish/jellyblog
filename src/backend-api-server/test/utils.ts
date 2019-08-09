import mongoose = require('mongoose');
import {Server} from "http";
import crypto from "crypto";
import {Model} from "mongoose";
import {IUserDocument} from "../auth/api/user-document";
import {TYPES} from "../ioc/types";
import {IUserRefreshTokenDocument} from "../token/api/user-refresh-token-document";
import {IPostAllDetailsPopulatedDocument} from "../post/dto/post-all-details-populated-document";
import {Readable, ReadableOptions} from "stream";
import {Container} from "inversify";

export class TestUtils {

    private UserModel: Model<IUserDocument>;
    private UserRefreshTokenModel: Model<IUserRefreshTokenDocument>;
    private PostModel: Model<IPostAllDetailsPopulatedDocument>;

    constructor(container: Container) {
        this.UserModel = container.get(TYPES.ModelUser);
        this.UserRefreshTokenModel = container.get(TYPES.ModelRefreshToken);
        this.PostModel = container.get(TYPES.ModelPost);

        this.tearDownHttpAndMongoose = this.tearDownHttpAndMongoose.bind(this);
        this.addTestUsers = this.addTestUsers.bind(this);
        this.clearTestUsers = this.clearTestUsers.bind(this);
        this.clearTestPosts = this.clearTestPosts.bind(this);
    }

    readonly adminUser = {
        username: 'testadmin',
        password: 'testsecret',
        role: 'admin'
    };

    readonly readerUser = {
        username: 'testreader',
        password: 'testsecret2',
        role: 'reader'
    };

    readonly apiRootPath = process.env.ROUTE_API_PATH || '/api';
    readonly fsRootPath = process.env.JB_GRIDFS_BASEURL || '/file';

    tearDownHttp(server: Server) {
        return new Promise((resolve, reject) => {
            server.close((err) => {
                if (err) {
                    reject(err);
                }
                resolve();
            });
        });
    };

    async tearDownHttpAndMongoose(server: Server) {
        await mongoose.connection.close();
        if (server) {
            await this.tearDownHttp(server);
        }
        return;
    }

    textToHash(inp: string): string {
        const hash = crypto.createHash('sha256');
        hash.update(inp);
        return hash.digest('hex').toUpperCase();
    }

    async addTestUsers() {
        await this.UserModel.create([
            Object.assign({}, this.adminUser, {password: this.textToHash(this.adminUser.password)}),
            Object.assign({}, this.readerUser, {password: this.textToHash(this.readerUser.password)}),
        ]);
    }

    async clearTestUsers() {
        await this.UserModel.deleteMany({
            $or: [
                {username: this.adminUser.username},
                {username: this.readerUser.username}
            ]
        }).exec();
        await this.UserRefreshTokenModel.deleteMany({
            username: {$in: [this.adminUser.username, this.readerUser.username]}
        }).exec();
    }

    async clearTestPosts(ids: string[]) {
        await this.PostModel.deleteMany({_id: {$in: ids}}).exec();
    }
}

/**
 * https://github.com/chrisallenlane/streamify-string
 */
export class StreamFromString extends Readable {
    constructor(str: string, opts?: ReadableOptions) {
        super(opts);
        this.str = str;
    }

    str: string;

    _read(size: number): void {
        const chunk = this.str.slice(0, size);
        if (chunk) {
            this.str = this.str.slice(size);
            this.push(chunk);
        } else {
            this.push(null);
        }
    }
}
