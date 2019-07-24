import Joi from '@hapi/joi';

export const postContentTypeSchema = Joi.string()
    .allow(
        'HTML',
        'MD',
    )
    .empty('')
    .default('HTML');
