import Joi from '@hapi/joi';
import {mongoObjectIdSchema} from "../../utils/dto/mongo-object-id.schema";
import {postHruSchema} from "./post-common.schema";

export const postGetRequestSchema = Joi.object({
    id: Joi.alternatives().try([mongoObjectIdSchema, postHruSchema]).required()
});
