import {IAggregateCacheRecord} from "./aggregate-cache-record";
import {Document} from "mongoose";

export interface IAggregateCacheRecordDocument<T = any> extends IAggregateCacheRecord<T>, Document {
}
