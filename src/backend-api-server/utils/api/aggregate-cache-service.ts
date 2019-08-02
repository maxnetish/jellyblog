import {IWithUserContext} from "../../auth/dto/with-user-context";
import {ITagListRequest} from "../../post/dto/tag-list-request";
import {ITagInfo} from "../../post/dto/tag-info";


export interface AggregateCachiableFunction {
    (request: ITagListRequest, opts: IWithUserContext): Promise<ITagInfo[]>;
    <T, U>(...aggregateFnArgs: T[]): Promise<U>
}

export interface IAggregateCacheService {
    applyCaching: {
        (opts: { key: string, ttl?: number, thisArg?: any, aggregateFn: AggregateCachiableFunction }): (request: ITagListRequest, opts: IWithUserContext) => Promise<ITagInfo[]>;
        <T, U>(opts: { key: string, ttl: number, thisArg?: any, aggregateFn: AggregateCachiableFunction }): (...aggregateFnArgs: T[]) => Promise<U>;
    };
}
