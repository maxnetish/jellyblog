export interface IAggregateCacheRecord<T> {
    key: string,
    expire: Date,
    data: T
}
