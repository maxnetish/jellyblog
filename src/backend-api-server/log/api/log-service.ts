import {FormatFn} from "koa-morgan";
import {ILogFindEntriesCriteria} from "../dto/log-find-entries-criteria";
import {IResponseWithPagination} from "../../utils/dto/response-with-pagination";
import {ILogEntry} from "../dto/log-entry";
import {IWithUserContext} from "../../auth/dto/with-user-context";

export interface ILogService {
    addEntryFromMorgan: FormatFn;
    findEntries(criteria: ILogFindEntriesCriteria, options: IWithUserContext): Promise<IResponseWithPagination<ILogEntry>>
}
