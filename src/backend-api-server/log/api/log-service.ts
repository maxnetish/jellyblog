import {TokenIndexer} from "koa-morgan";
import {IncomingMessage, ServerResponse} from "http";

export interface ILogService {
    addEntryFromMorgan(tokens: TokenIndexer, req: IncomingMessage, res: ServerResponse): string
}
