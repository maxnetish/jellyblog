import Joi from '@hapi/joi';

export const mongoObjectIdSchema = Joi.string().regex(/^[a-f\d]{24}$/i);
