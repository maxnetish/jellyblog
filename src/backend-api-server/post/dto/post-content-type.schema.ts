import Joi from '@hapi/joi';

export const postContentTypeSchema = Joi.string()
    .valid(
        'HTML',
        'MD',
    );
// .empty('')
// .default('HTML');
