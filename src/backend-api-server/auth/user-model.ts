import {Schema, model, Document} from 'mongoose';
import {IUserInfo} from "./user-info";

const userSchema = new Schema({
        username: {
            type: String,
            required: true,
            index: true,
            unique: true,
            maxlength: 64,
        },
        role: {
            type: String,
            required: true,
            enum: ['admin', 'reader'],
            'default': 'reader'
        },
        password: {
            type: String,
            required: true,
            maxlength: 128,
        },
    });

interface IUserModel extends IUserInfo, Document {
    password: string;
}

const UserModel = model<IUserModel>('User', userSchema);

export {
    UserModel,
    IUserModel,
}
