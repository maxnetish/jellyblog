import Joi from '@hapi/joi';

export const postAllowReadSchema = Joi.string()
    .allow(
        'FOR_ALL',
        'FOR_REGISTERED',
        'FOR_ME'
    )
    .empty('')
    .default('FOR_ALL');
