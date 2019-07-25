import Joi from '@hapi/joi';
import {requestWithPaginationSchema} from "../../utils/dto/request-with-pagination.schema";
import {postTagSchema} from "./post-common.schema";

export const postPublicFindCriteriaSchema = requestWithPaginationSchema.append({
    from: Joi.date(),
    to: Joi.date(),
    q: Joi.string().max(64),
    tag: postTagSchema,
});
