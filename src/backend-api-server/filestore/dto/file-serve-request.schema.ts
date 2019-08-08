import Joi from '@hapi/joi';
import {filenameSchema} from "./filename.schema";

export const fileServeRequestSchema = Joi.object({
    filename: filenameSchema.required(),
    bucket: Joi.string().alphanum().max(64),
});
