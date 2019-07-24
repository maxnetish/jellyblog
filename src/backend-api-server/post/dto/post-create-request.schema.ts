import Joi from '@hapi/joi';
import {postStatusSchema} from "./post-status.schema";
import {postAllowReadSchema} from "./post-allow-read.schema";
import {postContentTypeSchema} from "./post-content-type.schema";
import {postBriefSchema, postContentSchema, postHruSchema, postTagSchema, postTitleSchema} from "./post-common.schema";
import {mongoObjectIdSchema} from "../../utils/dto/mongo-object-id.schema";

export const postCreateRequestSchema = Joi.object({
    status: postStatusSchema.required(),
    allowRead: postAllowReadSchema.required(),
    contentType: postContentTypeSchema.required(),
    title: postTitleSchema.required(),
    brief: postBriefSchema,
    content: postContentSchema.required(),
    tags: Joi.array().items(postTagSchema).unique(),
    titleImg: mongoObjectIdSchema,
    attachments: Joi.array().items(mongoObjectIdSchema).unique(),
    hru: postHruSchema,
});
