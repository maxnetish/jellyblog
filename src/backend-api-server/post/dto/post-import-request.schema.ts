import Joi from '@hapi/joi';
import {mongoObjectIdSchema} from "../../utils/dto/mongo-object-id.schema";

export const postImportRequestSchema = Joi.object({
    id: Joi
        .array()
        .items(mongoObjectIdSchema)
        .max(64)
        .min(1)
        .single(true)
});
