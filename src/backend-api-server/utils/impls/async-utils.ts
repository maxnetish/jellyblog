import {IAsyncUtils} from "../api/async-utils";
import {injectable} from "inversify";

@injectable()
export class AsyncUtils implements IAsyncUtils {

    async asyncMap<T, U>(a: T[], callbackfn: (value: T, index: number, array: T[]) => Promise<U>, thisArg?: any): Promise<U[]> {
        const promises = a.map((value, index, array) => callbackfn.call(thisArg, value, index, array), thisArg);
        return await Promise.all(promises);
    }

}
