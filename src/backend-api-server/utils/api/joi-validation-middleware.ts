import {AnySchema} from "@hapi/joi";
import {Middleware} from "koa";

export interface IJoiValidationMiddlewareFactory {
    (args: { body?: AnySchema, query?: AnySchema, message?: string }): Middleware;
}
