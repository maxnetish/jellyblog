import Joi from '@hapi/joi';
import {usernameSchema} from "./credentials.schema";

export const userRemoveSchema = Joi.object().keys({
    username: usernameSchema
});
