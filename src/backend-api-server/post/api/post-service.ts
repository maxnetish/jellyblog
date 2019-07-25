import {IPostCreateRequest} from "../dto/post-create-request";
import {IPostAllDetails} from "../dto/post-all-details";
import {IWithUserContext} from "../../auth/dto/with-user-context";
import {IPostUpdateRequest} from "../dto/post-update-request";
import {IPostGetRequest} from "../dto/post-get-request";
import {IPostGetManyRequest} from "../dto/post-get-many-request";
import {IPostPermanent} from "../dto/post-permanent";
import {PostExportRequest} from "../dto/post-export-request";
import {IPostFindCriteria} from "../dto/post-find-criteria";
import {IResponseWithPagination} from "../../utils/dto/response-with-pagination";
import {IPostFindResultItem} from "../dto/post-find-result-item";
import {IPostPublicDetails} from "../dto/post-public-details";
import {IPostUpdateStatusRequest} from "../dto/post-update-status-request";
import {IPostPublicFindCriteria} from "../dto/post-public-find-criteria";
import {IPostPublicBrief} from "../dto/post-public-brief";

export interface IPostService {
    createPost(postCreateRequest: IPostCreateRequest, options: IWithUserContext): Promise<IPostAllDetails>;
    updatePost(postUpdateRequest: IPostUpdateRequest, options: IWithUserContext): Promise<IPostAllDetails>;
    exportPosts(postExportRequest: PostExportRequest, options: IWithUserContext): Promise<any>;
    getPost(postGetRequest: IPostGetRequest, options: IWithUserContext): Promise<IPostAllDetails>;
    importPosts(postImportRequest: IPostGetManyRequest, options: IWithUserContext): Promise<IPostPermanent[]>;
    find(postFindCriteria: IPostFindCriteria, options: IWithUserContext): Promise<IResponseWithPagination<IPostFindResultItem>>;
    publicGet(postGetRequest: IPostGetRequest, options: IWithUserContext): Promise<IPostPublicDetails>;
    updateStatus(postUpdateStatusRequest: IPostUpdateStatusRequest, options: IWithUserContext): Promise<boolean>;
    publicFind(postPublicFindCriteria: IPostPublicFindCriteria, options: IWithUserContext): Promise<IResponseWithPagination<IPostPublicBrief>>;
    remove(postGetManyRequest: IPostGetManyRequest, options: IWithUserContext): Promise<boolean>;
}
