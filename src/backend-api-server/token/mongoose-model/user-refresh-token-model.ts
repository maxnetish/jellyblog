import {Schema, model, Document} from 'mongoose';
import {IUserRefreshTokenInfo} from "../dto/user-refresh-token-info";

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

type IUserRefreshTokenModel = Document & IUserRefreshTokenInfo;

const UserRefreshTokenModel = model<IUserRefreshTokenModel>('UserRefreshToken', userRefreshTokenSchema);

export {
    UserRefreshTokenModel,
    IUserRefreshTokenModel,
    IUserRefreshTokenInfo,
}
