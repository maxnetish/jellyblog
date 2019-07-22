import Joi from '@hapi/joi';
import {mongoObjectIdSchema} from "../../utils/dto/mongo-object-id.schema";

export const fileMetadataContextSchema = Joi.string().min(3).max(64);

export const fileMetadataSchema = Joi.object().keys({
    context: Joi.string().min(3).max(64),
    postId: mongoObjectIdSchema,
    originalName: Joi.string().min(3).max(255),
    width: Joi.string().min(1).max(5),
    height: Joi.string().min(1).max(5),
    description: Joi.string().max(512),
});
