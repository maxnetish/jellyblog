import Joi from '@hapi/joi';
import {postStatusSchema} from "./post-status.schema";

export const tagListRequestSchema = Joi.object({
    status: Joi.array().items(postStatusSchema).min(1).unique().single().required()
});
