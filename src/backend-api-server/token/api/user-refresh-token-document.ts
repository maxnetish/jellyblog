import {Document} from "mongoose";
import {IUserRefreshTokenInfo} from "../dto/user-refresh-token-info";

export type IUserRefreshTokenDocument = Document & IUserRefreshTokenInfo;
