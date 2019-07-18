import {Schema, model} from 'mongoose';
import {IUserRefreshTokenDocument} from "../api/user-refresh-token-document";

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


const UserRefreshTokenModel = model<IUserRefreshTokenDocument>('UserRefreshToken', userRefreshTokenSchema);

export {
    UserRefreshTokenModel
}
