import Joi from '@hapi/joi';
import {mongoObjectIdSchema} from "../../utils/dto/mongo-object-id.schema";

export const fileRemoveRequestSchema = Joi.object({
    id: Joi.array().items(mongoObjectIdSchema).single(true).min(1).required()
});
