import {postCreateRequestSchema} from "./post-create-request.schema";
import {mongoObjectIdSchema} from "../../utils/dto/mongo-object-id.schema";

export const postUpdateRequestSchema = postCreateRequestSchema.append({
    _id: mongoObjectIdSchema.required()
});
