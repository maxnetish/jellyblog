import Joi from '@hapi/joi';
import {requestWithPaginationSchema} from "../../utils/dto/request-with-pagination.schema";
import {fileMetadataContextSchema} from "./file-metadata.schema";
import {mongoObjectIdSchema} from "../../utils/dto/mongo-object-id.schema";

export const fileFindCriteriaSchema = requestWithPaginationSchema.append({
    context: fileMetadataContextSchema,
    withoutPostId: Joi.boolean(),
    postId: mongoObjectIdSchema,
    contentType: Joi.string().max(64),
    dateTo: Joi.date(),
    dateFrom: Joi.date(),
});
