import {IWithUserContext} from "../../auth/dto/with-user-context";
import {ITagListRequest} from "../../post/dto/tag-list-request";
import {ITagInfo} from "../../post/dto/tag-info";

export interface IAggregateCacheService {
    applyCaching: {
        (opts: { key: string, ttl: number, aggregateFn: (request: ITagListRequest, opts: IWithUserContext) => Promise<ITagInfo[]> }): (request: ITagListRequest, opts: IWithUserContext) => Promise<ITagInfo[]>;
        <T, U>(opts: { key: string, ttl: number, aggregateFn: (...aggregateFnArgs: T[]) => Promise<U> }): (...aggregateFnArgs: T[]) => Promise<U>;
    }
}
