import Joi from "@hapi/joi";
import {userRoleSchema} from "./user-info.schema";
import {requestWithPaginationSchema} from "../../utils/dto/request-with-pagination.schema";

export const findUsersCriteriaSchema = requestWithPaginationSchema.append({
    username: Joi.string().max(32).optional(),
    role: Joi.array().max(8).items(userRoleSchema),
});
