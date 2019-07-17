import {IUserContext} from "../api/user-context";

export interface IWithUserContext {
    readonly user: IUserContext
}
