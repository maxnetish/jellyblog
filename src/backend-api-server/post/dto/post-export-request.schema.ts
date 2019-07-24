import Joi from '@hapi/joi';
import {postPermanentSchema} from "./post-permanent.schema";

export const postExportRequestSchema = Joi.array().items(postPermanentSchema).max(64).min(1);
