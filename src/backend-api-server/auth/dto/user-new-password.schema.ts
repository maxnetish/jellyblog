import Joi from '@hapi/joi';
import {passwordSchema, usernameSchema} from "./credentials.schema";

export const userNewPasswordSchema = Joi.object().keys({
    username: usernameSchema,
    password: passwordSchema,
    newPassword: passwordSchema,
});
