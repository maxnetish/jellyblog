import Joi from '@hapi/joi';

export interface ICredentials {
    username: string;
    password: string;
}

export const usernameSchema = Joi.string().min(3).max(64).required();
export const passwordSchema = Joi.string().min(3).max(128).required();
export const credentialsSchema = Joi.object().keys({
    username: usernameSchema,
    password: passwordSchema,
});
