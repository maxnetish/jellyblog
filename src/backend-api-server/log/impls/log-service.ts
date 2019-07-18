import {FormatFn, TokenIndexer} from "koa-morgan";
import {IncomingMessage, ServerResponse} from "http";
import {Request, Response} from "express";
import {inject, injectable} from "inversify";
import {ILogService} from "../api/log-service";
import {ILogEntryDocument} from "../api/log-entry-document";
import {Model} from "mongoose";
import {TYPES} from "../../ioc/types";

@injectable()
export class LogService implements ILogService {

    @inject(TYPES.ModelLog)
    private LogModel: Model<ILogEntryDocument>;

    addEntryFromMorgan: FormatFn = (tokens: TokenIndexer, req: IncomingMessage, res: ServerResponse) => {
        const reqAsRequest = req as Request;
        const resAsResponse = res as Response;
        const row = {
            requestUrl: tokens.url(reqAsRequest, resAsResponse),
            requestMethod: tokens.method(reqAsRequest, resAsResponse),
            responseTime: tokens['response-time'](reqAsRequest, resAsResponse),
            responseStatus: tokens.status(reqAsRequest, resAsResponse),
            referrer: tokens.referrer(reqAsRequest, resAsResponse),
            remoteAddress: tokens['realRemoteAddress'](reqAsRequest, resAsResponse),
            httpVersion: tokens['http-version'](reqAsRequest, resAsResponse),
            userAgent: tokens['user-agent'](reqAsRequest, resAsResponse),
            userName: tokens['user-name'](reqAsRequest, resAsResponse),
            date: tokens['date'](reqAsRequest, resAsResponse, 'iso')
        };

        this.LogModel.create(row);

        return '';
    };
}
