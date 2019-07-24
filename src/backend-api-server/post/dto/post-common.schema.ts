import Joi from '@hapi/joi';

export const postTitleSchema = Joi.string().max(512);
export const postBriefSchema = Joi.string().max(1024);
export const postContentSchema = Joi.string().max(131072);
export const postTagSchema = Joi.string().max(32);
export const postHruSchema = Joi.string().max(64);
