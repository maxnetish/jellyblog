import {Schema, model, Document} from 'mongoose';

const userRefreshTokenSchema = new Schema({
    username: {
        type: String,
        required: true,
        index: false,
        unique: false,
        maxlength: 64,
    },
    token: {
        type: String,
        required: true,
        unique: true,
        index: true,
        maxlength: 64,
    },
    validBefore: {
        type: Date,
        required: true,
    },
});

interface IUserRefreshTokenInfo {
    username: string;
    token: string;
    validBefore: Date;
}

type IUserRefreshTokenModel = Document & IUserRefreshTokenInfo;

const UserRefreshTokenModel = model<IUserRefreshTokenModel>('UserRefreshToken', userRefreshTokenSchema);

export {
    UserRefreshTokenModel,
    IUserRefreshTokenModel,
    IUserRefreshTokenInfo,
}
