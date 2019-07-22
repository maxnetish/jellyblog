import {Middleware} from "koa";
import Joi, {AnySchema} from '@hapi/joi';
import {IJoiValidationMiddlewareFactory} from "../api/joi-validation-middleware";

export const joiValidateMiddlewareFactory: IJoiValidationMiddlewareFactory =
    function joiValidateMiddlewareFactory<TBody, TQuery>({body, query, message}: { body?: AnySchema, query?: AnySchema, message?: string } = {}): Middleware {
        return async function joiValidate(ctx, next) {
            const reqQuery = ctx.state.query;
            const reqBody = ctx.request.body;
            if (body) {
                ctx.state.body = Joi.attempt<TBody>(reqBody, body, message);
            }
            if (query) {
                ctx.state.query = Joi.attempt<TQuery>(reqQuery, query, message);
            }
            await next();
        }
    };
