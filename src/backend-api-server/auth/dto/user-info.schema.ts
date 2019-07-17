import Joi from '@hapi/joi';
import {usernameSchema} from "./credentials.schema";

export const userRoleSchema = Joi.string().min(2).max(32).required();
export const userInfoSchema = Joi.object().keys({
    username: usernameSchema,
    role: userRoleSchema,
});
