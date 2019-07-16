import {TokenIndexer} from "koa-morgan";
import {IncomingMessage, ServerResponse} from "http";
import {LogModel} from '../mongoose-model/log-model';
import {Request, Response} from "express";
import {injectable} from "inversify";
import {ILogService} from "../api/log-service";

@injectable()
export class LogService implements ILogService{
    addEntryFromMorgan(tokens: TokenIndexer, req: IncomingMessage, res: ServerResponse): string {
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

        LogModel.create(row);

        return '';
    }
}
