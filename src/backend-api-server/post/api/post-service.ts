import {IPostCreateRequest} from "../dto/post-create-request";
import {IPostAllDetails} from "../dto/post-all-details";
import {IWithUserContext} from "../../auth/dto/with-user-context";
import {IPostUpdateRequest} from "../dto/post-update-request";
import {IPostGetRequest} from "../dto/post-get-request";
import {IPostImportRequest} from "../dto/post-import-request";
import {IPostPermanent} from "../dto/post-permanent";
import {PostExportRequest} from "../dto/post-export-request";

export interface IPostService {
    createPost(postCreateRequest: IPostCreateRequest, options: IWithUserContext): Promise<IPostAllDetails>;
    updatePost(postUpdateRequest: IPostUpdateRequest, options: IWithUserContext): Promise<IPostAllDetails>;
    exportPosts(postExportRequest: PostExportRequest, options: IWithUserContext): Promise<any>;
    getPost(postGetRequest: IPostGetRequest, options: IWithUserContext): Promise<IPostAllDetails>;
    importPosts(postImportRequest: IPostImportRequest, options: IWithUserContext): Promise<IPostPermanent[]>
}
