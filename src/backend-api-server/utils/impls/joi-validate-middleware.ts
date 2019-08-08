import {Middleware} from "koa";
import Joi, {AnySchema} from '@hapi/joi';
import {IJoiValidationMiddlewareFactory} from "../api/joi-validation-middleware";

export const joiValidateMiddlewareFactory: IJoiValidationMiddlewareFactory =
    function joiValidateMiddlewareFactory<TBody, TQuery, TParams>({body, query, params, message}: { body?: AnySchema, query?: AnySchema, params?: AnySchema, message?: string } = {}): Middleware {
        return async function joiValidate(ctx, next) {
            const reqQuery = ctx.state.query;
            const reqBody = ctx.request.body;
            const reqParams = ctx.params;
            if (body) {
                ctx.state.body = Joi.attempt<TBody>(reqBody, body, message);
            }
            if (query) {
                ctx.state.query = Joi.attempt<TQuery>(reqQuery, query, message);
            }
            if(params) {
                ctx.state.params = Joi.attempt<TParams>(reqParams, params, message);
            }
            await next();
        }
    };
