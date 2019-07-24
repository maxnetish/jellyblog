import Joi from '@hapi/joi';

export const postStatusSchema = Joi.string()
    .allow(
        'DRAFT',
        'PUB',
    )
    .empty('')
    .default('DRAFT');
