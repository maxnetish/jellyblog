export interface IAsyncUtils {
    asyncMap<T, U>(a: T[], callbackfn: (value: T, index: number, array: T[]) => Promise<U>, thisArg?: any): Promise<U[]>;
}
