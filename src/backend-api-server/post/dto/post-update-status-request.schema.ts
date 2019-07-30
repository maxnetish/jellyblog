import {postGetManyRequestSchema} from "./post-get-many-request.schema";
import {postStatusSchema} from "./post-status.schema";

export const postUpdateStatusRequestSchema = postGetManyRequestSchema.append({
    status: postStatusSchema.required()
});
