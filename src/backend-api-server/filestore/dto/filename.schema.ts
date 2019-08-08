import Joi from '@hapi/joi';

export const filenameSchema = Joi.string().regex(/^[a-f\d]{3,64}$/i);
