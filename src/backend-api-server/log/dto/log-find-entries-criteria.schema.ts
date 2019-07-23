import Joi from '@hapi/joi';
import {requestWithPaginationSchema} from "../../utils/dto/request-with-pagination.schema";

export const logFindEntriesCriteriaSchema = requestWithPaginationSchema.append({
    err: Joi.boolean(),
    dateTo: Joi.date(),
    dateFrom: Joi.date(),
});
