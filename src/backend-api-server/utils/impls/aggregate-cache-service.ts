import {AggregateCachiableFunction, IAggregateCacheService} from "../api/aggregate-cache-service";
import {inject, injectable} from "inversify";
import {TYPES} from "../../ioc/types";
import {IAggregateCacheRecordDocument} from "../dto/aggregate-cache-record-document";
import {Model} from "mongoose";
import hash = require('object-hash');
import moment = require("moment");

@injectable()
export class AggregateCacheService implements IAggregateCacheService {

    @inject(TYPES.ModelAggregateCache)
    private ModelAggregateCache: Model<IAggregateCacheRecordDocument>;

    applyCaching<T, U>(
        {key, ttl = 86400000, aggregateFn, thisArg}: {
            key: string;
            ttl?: number;
            aggregateFn: AggregateCachiableFunction;
            thisArg?: any
        }): (...aggregateFnArgs: T[]) => Promise<U> {
        return async (...args) => {
            const recordHash = hash({
                key,
                params: args,
            }, {
                respectFunctionNames: false,
                respectFunctionProperties: false,
            });
            const dt = new Date();

            let foundCacheDoc = await this.ModelAggregateCache.findOne({key: recordHash}).exec();

            if (foundCacheDoc && foundCacheDoc.expire > dt) {
                // cache clear - use it
                return foundCacheDoc.data;
            }

            // cache dirty - get data from aggregateFn
            foundCacheDoc = foundCacheDoc || new this.ModelAggregateCache({key: recordHash});
            foundCacheDoc.expire = moment(dt).add(ttl, 'ms').toDate();
            foundCacheDoc.data = await aggregateFn.call(thisArg, ...args);
            await foundCacheDoc.save();
            return foundCacheDoc.data;
        };

    }
}
