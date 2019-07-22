import Joi from '@hapi/joi';

export const requestWithPaginationSchema = Joi.object().keys({
    page: Joi.number().min(1).max(9999).integer().positive().optional()
});
