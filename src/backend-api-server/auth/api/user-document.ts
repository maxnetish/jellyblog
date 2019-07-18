import {IUserInfo} from "../dto/user-info";
import {Document} from "mongoose";

export interface IUserDocument extends IUserInfo, Document {
    password: string;
}
