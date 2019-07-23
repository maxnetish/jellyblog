import {FormatFn, TokenIndexer} from "koa-morgan";
import {IncomingMessage, ServerResponse} from "http";
import {Request, Response} from "express";
import {inject, injectable} from "inversify";
import {ILogService} from "../api/log-service";
import {ILogEntryDocument} from "../dto/log-entry-document";
import {Model} from "mongoose";
import {TYPES} from "../../ioc/types";
import {ILogFindEntriesCriteria} from "../dto/log-find-entries-criteria";
import {IResponseWithPagination} from "../../utils/dto/response-with-pagination";
import {ILogEntry} from "../dto/log-entry";
import {IWithUserContext} from "../../auth/dto/with-user-context";
import {IPaginationUtils} from "../../utils/api/pagination-utils";

@injectable()
export class LogService implements ILogService {

    @inject(TYPES.ModelLog)
    private LogModel: Model<ILogEntryDocument>;

    @inject(TYPES.PaginationUtils)
    private paginationUtils: IPaginationUtils;

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

    async findEntries(criteria: ILogFindEntriesCriteria, options: IWithUserContext): Promise<IResponseWithPagination<ILogEntry>> {
        options.user.assertAuth([
            {role: ['admin']}
        ]);

        const conditions: any = {};

        if (criteria.err === true) {
            conditions.error = {$exists: true};
        } else if (criteria.err === false) {
            conditions.error = {$exists: false}
        }

        if (criteria.dateTo) {
            conditions.date = {$lte: criteria.dateTo};
        }

        if (criteria.dateFrom) {
            conditions.date = conditions.date || {};
            conditions.date.$gte = criteria.dateFrom
        }

        // opts:
        const {skip, limit, page} = this.paginationUtils.skipLimitFromPaginationRequest(criteria);

        const foundDocuments = await this.LogModel
            .find(conditions)
            .lean(true)
            .limit(limit + 1)
            .skip(skip)
            .sort('-_id')
            .exec();

        return {
            hasMore: foundDocuments.length > limit,
            items: foundDocuments.slice(0, limit),
            itemsPerPage: limit,
            page
        };
    }


}
