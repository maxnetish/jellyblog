import Joi from '@hapi/joi';
import {passwordSchema, usernameSchema} from "./credentials.schema";
import {userRoleSchema} from "./user-info.schema";

export const userCreateNewSchema = Joi.object().keys({
    username: usernameSchema,
    password: passwordSchema,
    role: userRoleSchema,
});
