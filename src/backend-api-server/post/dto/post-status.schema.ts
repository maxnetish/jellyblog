import Joi from '@hapi/joi';

export const postStatusSchema = Joi.string()
    .valid(
        'DRAFT',
        'PUB',
    );
// .empty('');
// .default('DRAFT');
