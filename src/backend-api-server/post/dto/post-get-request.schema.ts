import Joi from '@hapi/joi';
import {mongoObjectIdSchema} from "../../utils/dto/mongo-object-id.schema";

export const postGetRequestSchema = Joi.object({
    id: mongoObjectIdSchema
});
