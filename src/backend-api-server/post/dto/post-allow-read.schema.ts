import Joi from '@hapi/joi';

export const postAllowReadSchema = Joi.string()
    .valid(
        'FOR_ALL',
        'FOR_REGISTERED',
        'FOR_ME'
    );
    // .empty('')
    // .default('FOR_ALL');
