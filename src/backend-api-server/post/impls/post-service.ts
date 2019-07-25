import {IPostService} from "../api/post-service";
import {IPostCreateRequest} from "../dto/post-create-request";
import {IWithUserContext} from "../../auth/dto/with-user-context";
import {IPostAllDetails} from "../dto/post-all-details";
import {IPostPermanent} from "../dto/post-permanent";
import {IPostFindCriteria} from "../dto/post-find-criteria";
import {IResponseWithPagination} from "../../utils/dto/response-with-pagination";
import {IPostFindResultItem} from "../dto/post-find-result-item";
import {IPostGetRequest} from "../dto/post-get-request";
import {IPostGetManyRequest} from "../dto/post-get-many-request";
import {IPostPublicFindCriteria} from "../dto/post-public-find-criteria";
import {IPostPublicBrief} from "../dto/post-public-brief";
import {IPostPublicDetails} from "../dto/post-public-details";
import {IPostUpdateRequest} from "../dto/post-update-request";
import {IPostUpdateStatusRequest} from "../dto/post-update-status-request";
import {Model} from "mongoose";
import {IPostAllDetailsDocument} from "../dto/post-all-details-document";
import {inject, injectable} from "inversify";
import {TYPES} from "../../ioc/types";
import {IPaginationUtils} from "../../utils/api/pagination-utils";
import {IUserContext} from "../../auth/api/user-context";

@injectable()
export class PostService implements IPostService {

    @inject(TYPES.ModelPost)
    private PostModel: Model<IPostAllDetailsDocument>;

    @inject(TYPES.PaginationUtils)
    private paginationUtils: IPaginationUtils;

    private static postAllDetails2Plain(doc: IPostAllDetailsDocument): IPostAllDetails {
        return {
            _id: doc._id,
            allowRead: doc.allowRead,
            attachments: doc.attachments,
            author: doc.author,
            brief: doc.brief,
            content: doc.content,
            contentType: doc.contentType,
            createDate: doc.createDate,
            hru: doc.hru,
            pubDate: doc.pubDate,
            status: doc.status,
            tags: doc.tags,
            title: doc.title,
            titleImg: doc.titleImg,
            updateDate: doc.updateDate,
            url: doc.url,
        };
    }

    private static permissionsForUser(post: IPostAllDetails, user: IUserContext): { allowView: boolean, allowUpdate: boolean } {
        let result = {
            allowView: false,
            allowUpdate: false
        };

        switch (post.status) {
            case 'PUB':
                // post published, see who can read...
                switch (post.allowRead) {
                    case 'FOR_REGISTERED':
                        // allow read for all autenticated users
                        result.allowView = user.authenticated;
                        break;
                    case 'FOR_ME':
                        // allow read for logged in author
                        result.allowView = user.username === post.author;
                        break;
                    case 'FOR_ALL':
                        // allow read for all users
                        result.allowView = true;
                        break;
                }
                break;
            case 'DRAFT':
                // only author can view drafts
                result.allowView = user.username === post.author;
                break;
        }

        // Only author can update
        result.allowUpdate = user && user.username === post.author;

        return result;
    }

    async createPost(postCreateRequest: IPostCreateRequest, options: IWithUserContext): Promise<IPostAllDetails> {
        options.user.assertAuth([{role: ['admin']}]);

        const currentDate = new Date();
        const newDocData = {
            status: postCreateRequest.status,
            allowRead: postCreateRequest.allowRead,
            createDate: currentDate,
            pubDate: postCreateRequest.status === 'PUB' ? currentDate : null,
            updateDate: currentDate,
            author: options.user.username,
            contentType: postCreateRequest.contentType,
            title: postCreateRequest.title,
            brief: postCreateRequest.brief,
            content: postCreateRequest.content,
            tags: postCreateRequest.tags,
            titleImg: postCreateRequest.titleImg,
            attachments: postCreateRequest.attachments,
            hru: postCreateRequest.hru,
        };

        const newDoc = await this.PostModel.create(newDocData);
        const enrichedNewDoc = await this.PostModel.populate<IPostAllDetailsDocument>(newDoc, {path: 'attachments titleImg'});
        return PostService.postAllDetails2Plain(enrichedNewDoc);
    }

    async exportPosts(postExportRequest: IPostPermanent[], options: IWithUserContext): Promise<any> {
        options.user.assertAuth([{role: ['admin']}]);
        const newDocsData = postExportRequest.map(pp => {
            return {
                status: pp.status,
                allowRead: pp.allowRead,
                createDate: pp.createDate,
                pubDate: pp.pubDate,
                updateDate: pp.updateDate,
                author: options.user.username,
                contentType: pp.contentType,
                title: pp.title,
                brief: pp.brief,
                content: pp.content,
                tags: pp.tags,
                titleImg: pp.titleImg,
                attachments: pp.attachments,
                hru: pp.hru,
            };
        });
        const insertResult = await this.PostModel.insertMany(newDocsData);
        return insertResult;
    }

    async find(postFindCriteria: IPostFindCriteria, options: IWithUserContext): Promise<IResponseWithPagination<IPostFindResultItem>> {
        options.user.assertAuth([{role: ['admin']}]);

        const conditions: any = {};

        if (postFindCriteria.q) {
            // full text search
            conditions.$text = {
                $search: postFindCriteria.q,
                $caseSensitive: false,
                $diacriticSensitive: false
            }
        }

        if (postFindCriteria.from) {
            conditions.createDate = {
                $gte: postFindCriteria.from
            };
        }

        if (postFindCriteria.to) {
            conditions.createDate = conditions.createDate || {};
            conditions.createDate.$lte = postFindCriteria.to;
        }

        if (postFindCriteria.ids && postFindCriteria.ids.length) {
            conditions._id = {
                $in: postFindCriteria.ids
            };
        }

        if (postFindCriteria.statuses && postFindCriteria.statuses.length) {
            conditions.status = {
                $in: postFindCriteria.statuses
            };
        }

        // find only posts of current user
        conditions.author = options.user.username;

        // pagination (use pagination only if not setted ids - I forgot why)
        const {skip, limit, page} = (postFindCriteria.ids && postFindCriteria.ids.length) ?
            {skip: 0, limit: 64, page: 1} :
            this.paginationUtils.skipLimitFromPaginationRequest(postFindCriteria);

        const projection = '_id status createDate updateDate pubDate titleImg title brief';

        const foundDocs = await this.PostModel
            .find(conditions, projection)
            .sort('-createDate')
            .skip(skip)
            .limit(limit + 1)
            .lean(true)
            .populate('titleImg')
            .exec();

        return {
            hasMore: foundDocs.length > limit,
            items: foundDocs.slice(0, limit),
            itemsPerPage: limit,
            page,
        };
    }

    async getPost(postGetRequest: IPostGetRequest, options: IWithUserContext): Promise<IPostAllDetails> {
        options.user.assertAuth([{role: ['admin']}]);

        const foundDoc = await this.PostModel
            .findById(postGetRequest.id)
            .exec();

        if (!foundDoc) {
            // assert 404 error
            throw {status: 404};
        }

        const postPermissions = PostService.permissionsForUser(foundDoc, options.user);
        if (!postPermissions.allowView) {
            // current user cannot read post - assert 401 status
            throw {status: 401};
        }

        const enrichedDoc = await this.PostModel.populate<IPostAllDetailsDocument>(foundDoc, {path: 'attachments titleImg'});

        return PostService.postAllDetails2Plain(enrichedDoc);
    }

    importPosts(postImportRequest: IPostGetManyRequest, options: IWithUserContext): Promise<IPostPermanent[]> {
        return undefined;
    }

    publicFind(postPublicFindCriteria: IPostPublicFindCriteria, options: IWithUserContext): Promise<IResponseWithPagination<IPostPublicBrief>> {
        return undefined;
    }

    publicGet(postGetRequest: IPostGetRequest, options: IWithUserContext): Promise<IPostPublicDetails> {
        return undefined;
    }

    remove(postGetManyRequest: IPostGetManyRequest, options: IWithUserContext): Promise<boolean> {
        return undefined;
    }

    updatePost(postUpdateRequest: IPostUpdateRequest, options: IWithUserContext): Promise<IPostAllDetails> {
        return undefined;
    }

    updateStatus(postUpdateStatusRequest: IPostUpdateStatusRequest, options: IWithUserContext): Promise<boolean> {
        return undefined;
    }

}
