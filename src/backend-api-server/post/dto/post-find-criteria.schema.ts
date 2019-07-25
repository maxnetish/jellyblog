import Joi from '@hapi/joi';
import {requestWithPaginationSchema} from "../../utils/dto/request-with-pagination.schema";
import {postStatusSchema} from "./post-status.schema";
import {mongoObjectIdSchema} from "../../utils/dto/mongo-object-id.schema";

export const postFindCriteriaSchema = requestWithPaginationSchema.append({
    from: Joi.date(),
    to: Joi.date(),
    q: Joi.string().max(64),
    statuses: Joi.array().items(postStatusSchema).single(true),
    ids: Joi.array().items(mongoObjectIdSchema).max(64),
});
