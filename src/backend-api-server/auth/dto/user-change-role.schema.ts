import Joi from '@hapi/joi';
import {userRoleSchema} from "./user-info.schema";
import {usernameSchema} from "./credentials.schema";

export const userChangeRoleSchema = Joi.object().keys({
    username: usernameSchema,
    role: userRoleSchema,
});
