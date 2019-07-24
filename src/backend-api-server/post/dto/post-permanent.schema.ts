import Joi from '@hapi/joi';
import {mongoObjectIdSchema} from "../../utils/dto/mongo-object-id.schema";
import {postStatusSchema} from "./post-status.schema";
import {postAllowReadSchema} from "./post-allow-read.schema";
import {postContentTypeSchema} from "./post-content-type.schema";
import {postContentSchema, postHruSchema, postTagSchema, postTitleSchema} from "./post-common.schema";

export const postPermanentSchema = Joi.object({
    _id: mongoObjectIdSchema,
    status: postStatusSchema.required(),
    allowRead: postAllowReadSchema.required(),
    createDate: Joi.date(),
    pubDate: Joi.date(),
    updateDate: Joi.date(),
    contentType: postContentTypeSchema.required(),
    title: postTitleSchema,
    content: postContentSchema.required(),
    tags: Joi.array().items(postTagSchema).unique(),
    titleImg: mongoObjectIdSchema,
    attachments: Joi.array().items(mongoObjectIdSchema).unique(),
    hru: postHruSchema,
});
