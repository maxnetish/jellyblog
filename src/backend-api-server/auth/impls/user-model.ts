import {Schema, model} from 'mongoose';
import {IUserDocument} from "../api/user-document";

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

const UserModel = model<IUserDocument>('User', userSchema);

export {
    UserModel
}
