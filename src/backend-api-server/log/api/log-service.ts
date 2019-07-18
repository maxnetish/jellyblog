import {FormatFn} from "koa-morgan";

export interface ILogService {
    addEntryFromMorgan: FormatFn;
}
