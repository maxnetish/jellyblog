import {Context} from "koa";
import httpStatuses from 'statuses';
import {IFailResult} from "./fail-result";

export function writeFailResultTo(context: Context, status: number = 500, message?: string): Context {

    const body: IFailResult = {
        message: message || httpStatuses[status] || null,
    };

    context.state.errMessage = body.message;
    context.status = status;
    context.body = body;

    return context;
}
