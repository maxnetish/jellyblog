import Joi from "@hapi/joi";
import {userRoleSchema} from "./user-info.schema";

export const findUsersCriteriaSchema = Joi.object().keys({
    username: Joi.string().max(32).optional(),
    role: Joi.array().max(8).items(userRoleSchema),
});
