import Joi from '@hapi/joi';

export const optionsRobotsTxtSchema = Joi.object().keys({
    content: Joi.string().max(1024).required(),
    allowRobots: Joi.boolean().required(),
});
