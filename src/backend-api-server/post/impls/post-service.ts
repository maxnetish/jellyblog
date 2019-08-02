import {IPostService} from "../api/post-service";
import {IPostCreateRequest} from "../dto/post-create-request";
import {IWithUserContext} from "../../auth/dto/with-user-context";
import {IPostAllDetailsPopulated} from "../dto/post-all-details-populated";
import {IPostPermanent} from "../dto/post-permanent";
import {IPostFindCriteria} from "../dto/post-find-criteria";
import {IResponseWithPagination} from "../../utils/dto/response-with-pagination";
import {IPostFindResultItem} from "../dto/post-find-result-item";
import {IPostGetByObjectidRequest} from "../dto/post-get-by-objectid-request";
import {IPostGetManyRequest} from "../dto/post-get-many-request";
import {IPostPublicFindCriteria} from "../dto/post-public-find-criteria";
import {IPostPublicBrief} from "../dto/post-public-brief";
import {IPostPublicDetails} from "../dto/post-public-details";
import {IPostUpdateRequest} from "../dto/post-update-request";
import {IPostUpdateStatusRequest} from "../dto/post-update-status-request";
import {Model, Types} from "mongoose";
import {IPostAllDetailsPopulatedDocument} from "../dto/post-all-details-populated-document";
import {inject, injectable} from "inversify";
import {TYPES} from "../../ioc/types";
import {IPaginationUtils} from "../../utils/api/pagination-utils";
import {IUserContext} from "../../auth/api/user-context";
import {IPostAllDetails} from "../dto/post-all-details";
import {IMarkdownConverter} from "../../utils/api/markdown-converter";
import {IPostGetRequest} from "../dto/post-get-request";
import {IFileService} from "../../filestore/api/file-service";
import {IAsyncUtils} from "../../utils/api/async-utils";
import {ITagListRequest} from "../dto/tag-list-request";
import {ITagInfo} from "../dto/tag-info";
import {IAggregateCacheService} from "../../utils/api/aggregate-cache-service";


@injectable()
export class PostService implements IPostService {

    @inject(TYPES.ModelPost)
    private PostModel: Model<IPostAllDetailsPopulatedDocument>;

    @inject(TYPES.PaginationUtils)
    private paginationUtils: IPaginationUtils;

    @inject(TYPES.MarkdownConverter)
    private markdownConverter: IMarkdownConverter;

    @inject(TYPES.FileService)
    private fileService: IFileService;

    @inject(TYPES.AsyncUtils)
    private asyncUtils: IAsyncUtils;

    @inject(TYPES.AggregateCacheService)
    private aggregateCacheService: IAggregateCacheService;

    private static postAllDetails2Plain(doc: IPostAllDetailsPopulatedDocument): IPostAllDetailsPopulated {
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

    private static postDetails2PostPermanent(p: IPostAllDetails): IPostPermanent {
        return {
            updateDate: p.updateDate,
            titleImg: p.titleImg,
            title: p.title,
            tags: p.tags,
            status: p.status,
            pubDate: p.pubDate,
            hru: p.hru,
            createDate: p.createDate,
            contentType: p.contentType,
            content: p.content,
            brief: p.brief,
            attachments: p.attachments,
            allowRead: p.allowRead,
            _id: p._id,
        };
    }

    private static permissionsForUser(post: Partial<IPostAllDetails>, user: IUserContext): { allowView: boolean, allowUpdate: boolean } {
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

    private static tryValidateObjectId(val: string): Types.ObjectId | null {
        if (!Types.ObjectId.isValid(val)) {
            return null;
        }
        const objectId = new Types.ObjectId(val);
        if (objectId.equals(val)) {
            return objectId;
        }
        return null;
    }

    private async canUpdatePostById(id: string, user: IUserContext): Promise<boolean> {
        const existentDoc = await this.PostModel
            .findById(id, '_id allowRead status author')
            .lean(true)
            .exec();

        if (!existentDoc) {
            // post not found
            return true;
        }

        const permissions = PostService.permissionsForUser(existentDoc, user);
        return permissions.allowUpdate;
    }

    private async getAggregatedTagsInternal(tagRequest: ITagListRequest, options: IWithUserContext): Promise<ITagInfo[]> {
        // any user can, but results depends on user context
        // use aggregates, it much more speedy than mapReduce
        const tagBaseUrl = process.env.JB_TAG_BASEURL || '/tag';
        const matchOptions: any = {
            status: {$in: tagRequest.status}
        };

        if (options.user.authenticated) {
            matchOptions.$or = [
                {allowRead: 'FOR_ALL'},
                {allowRead: 'FOR_REGISTERED'},
                {allowRead: 'FOR_ME', author: options.user.username}
            ]
        } else {
            matchOptions.allowRead = 'FOR_ALL';
        }

        const resultWithoutUrl = await this.PostModel.aggregate([
            // find docs corrsponding to matchOptions
            {$match: matchOptions},
            // get only _id and tags
            {$project: {_id: 0, tags: 1}},
            // unwind array of tags: for each single tag in tag array get single doc
            {$unwind: '$tags'},
            // remap: to doc like {tag: 'some_tag'}
            {$project: {tag: '$tags'}},
            // group by tag and count each inclusion
            {$group: {_id: '$tag', count: {$sum: 1}}},
            // remap to {tag, count}
            {$project: {_id: 0, tag: '$_id', count: 1}},
            // and sort by tag alphabetically
            {$sort: {tag: 1}}
        ])
            .allowDiskUse(true)
            .exec();

        const result = resultWithoutUrl.map((ti: ITagInfo) => {
            ti.url = `${tagBaseUrl}/${encodeURIComponent(ti.tag)}`;
            return ti;
        });

        return result;
    }

    async createPost(postCreateRequest: IPostCreateRequest, options: IWithUserContext): Promise<IPostAllDetailsPopulated> {

        options.user.assertAuth([{role: ['admin']}]);

        const currentDate = new Date();
        const newDocData: Partial<IPostAllDetails> = {
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
        const enrichedNewDoc = await this.PostModel.populate<IPostAllDetailsPopulatedDocument>(newDoc, {path: 'attachments titleImg'});
        return PostService.postAllDetails2Plain(enrichedNewDoc);
    }

    async exportPosts(postExportRequest: IPostPermanent[], options: IWithUserContext): Promise<IPostAllDetailsPopulated[]> {
        options.user.assertAuth([{role: ['admin']}]);
        const newDocsData = postExportRequest.map(pp => {
            return {
                _id: pp._id,
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
        return insertResult.map(PostService.postAllDetails2Plain);
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

    async getPost(postGetRequest: IPostGetByObjectidRequest, options: IWithUserContext): Promise<IPostAllDetailsPopulated> {
        options.user.assertAuth([{role: ['admin']}]);

        const foundDoc = await this.PostModel
            .findById(postGetRequest.id)
            .exec();

        if (!foundDoc) {
            // assert 404 error
            throw {status: 404};
        }

        const postPermissions = PostService.permissionsForUser({
            author: foundDoc.author,
            allowRead: foundDoc.allowRead,
            status: foundDoc.status
        }, options.user);
        if (!postPermissions.allowView) {
            // current user cannot read post - assert 401 status
            throw {status: 401};
        }

        const enrichedDoc = await this.PostModel.populate<IPostAllDetailsPopulatedDocument>(foundDoc, {path: 'attachments titleImg'});

        return PostService.postAllDetails2Plain(enrichedDoc);
    }

    async importPosts(postImportRequest: IPostGetManyRequest, options: IWithUserContext): Promise<IPostPermanent[]> {
        options.user.assertAuth([{role: ['admin']}]);

        const conditions: any = {
            _id: {
                $in: Array.isArray(postImportRequest.id) ? postImportRequest.id : [postImportRequest.id]
            },
            // import only posts of current user
            author: options.user.username
        };

        const foundDocs = await this.PostModel.find(conditions)
            .limit(64)
            .lean(true)
            .exec();
        // foundDocs is not enriched dtos: IPostAllDetails
        return foundDocs.map(PostService.postDetails2PostPermanent);
    }

    async publicFind(postPublicFindCriteria: IPostPublicFindCriteria, options: IWithUserContext): Promise<IResponseWithPagination<IPostPublicBrief>> {
        // For all users, but we have permissions in individual entity

        const conditions: any = {
            // allow only published entity
            status: 'PUB'
        };

        if (postPublicFindCriteria.tag) {
            conditions.tags = postPublicFindCriteria.tag;
        }

        if (postPublicFindCriteria.from) {
            conditions.createDate = {
                $gte: postPublicFindCriteria.from
            };
        }

        if (postPublicFindCriteria.to) {
            conditions.createDate = conditions.createDate || {};
            conditions.createDate.$lte = postPublicFindCriteria.to;
        }

        if (postPublicFindCriteria.q) {
            // full text index search
            conditions.$text = {
                $search: postPublicFindCriteria.q,
                $caseSensitive: false,
                $diacriticSensitive: false
            }
        }

        // to fetch posts that allow only for 'me' and 'any authorized'
        if (options.user.authenticated) {
            conditions.$or = [
                {allowRead: 'FOR_ALL'},
                {allowRead: 'FOR_REGISTERED'},
                {allowRead: 'FOR_ME', author: options.user.username},
            ]
        } else {
            conditions.allowRead = 'FOR_ALL'
        }

        // pagination
        const {skip, limit, page} = this.paginationUtils.skipLimitFromPaginationRequest(postPublicFindCriteria);

        const projection = '_id contentType createDate updateDate pubDate titleImg title brief content tags hru';

        let foundDocs = await this.PostModel
            .find(conditions, projection)
            .sort('-createDate')
            .skip(skip)
            .limit(limit + 1)
            .populate('titleImg')
            .exec();

        const hasMore = foundDocs.length > limit;

        foundDocs = foundDocs.slice(0, limit);

        const items = await this.asyncUtils.asyncMap(foundDocs, async (p): Promise<IPostPublicBrief> => {
            const preview = p.contentType === 'MD' ?
                await this.markdownConverter.markdown2Html(p.brief || p.content) :
                (p.brief || p.content);
            return {
                _id: p._id,
                createDate: p.createDate,
                pubDate: p.pubDate,
                tags: p.tags,
                title: p.title,
                titleImg: p.titleImg,
                updateDate: p.updateDate,
                url: p.url,
                preview,
                useCut: !!p.brief
            }
        });

        return {
            page,
            itemsPerPage: limit,
            hasMore,
            items,
        };
    }

    async publicGet(postGetRequest: IPostGetRequest, options: IWithUserContext): Promise<IPostPublicDetails> {
        // Allow for all users, additional permissioins in entity
        const conditions: any = {};
        const objectId = PostService.tryValidateObjectId(postGetRequest.id);

        if (objectId) {
            conditions._id = objectId;
        } else {
            conditions.hru = postGetRequest.id;
        }

        const projection = '_id status createDate pubDate updateDate contentType title brief content tags titleImg hru allowRead author';

        const foundDoc = await this.PostModel
            .findOne(conditions, projection)
            .populate('titleImg')
            .exec();

        if (!foundDoc) {
            throw {status: 404};
        }

        if (!PostService.permissionsForUser({
            status: foundDoc.status,
            allowRead: foundDoc.allowRead,
            author: foundDoc.author
        }, options.user).allowView) {
            // Not enough authority to view
            throw {status: 401};
        }

        return {
            createDate: foundDoc.createDate,
            _id: foundDoc._id,
            content: foundDoc.contentType === 'MD' ?
                await this.markdownConverter.markdown2Html(foundDoc.content) :
                foundDoc.content,
            pubDate: foundDoc.pubDate,
            tags: foundDoc.tags,
            title: foundDoc.title,
            titleImg: foundDoc.titleImg,
            updateDate: foundDoc.updateDate,
            url: foundDoc.url,
        };
    }

    async remove(postGetManyRequest: IPostGetManyRequest, options: IWithUserContext): Promise<boolean> {
        options.user.assertAuth([{role: ['admin']}]);

        const ids = Array.isArray(postGetManyRequest.id) ? postGetManyRequest.id : [postGetManyRequest.id];

        // array like [true, true, false, true] where false means that we cannot remove corresponding post
        // we won't throws, we will remove entity that we can remove
        const canRemove = await Promise.all(ids.map(id => this.canUpdatePostById(id, options.user)));

        // id of posts that we can remove
        const idsThatCanRemove = ids.filter((val, ind) => canRemove[ind]);

        const removedPostDocs = await Promise.all(
            idsThatCanRemove.map(id => this.PostModel.findByIdAndRemove(id).lean(true).exec())
        );

        const resultOfRemovingFiles = await Promise.all(
            removedPostDocs.map(removedPost => {
                if (removedPost && removedPost.attachments && removedPost.attachments.length) {
                    return this.fileService.remove({id: removedPost.attachments}, options);
                }
                return 0;
            })
        );

        // TODO See what we actually get in result. Possibly array of native mongo query results.
        // May be we should expose result
        return true;
    }

    async updatePost(postUpdateRequest: IPostUpdateRequest, options: IWithUserContext): Promise<IPostAllDetailsPopulated> {
        options.user.assertAuth([{role: ['admin']}]);

        // fetch existent doc to check permissions and to update attachments
        const existentDoc: Partial<IPostAllDetails> = await this.PostModel
            .findById(postUpdateRequest._id, '_id attachments allowRead status author')
            .lean(true)
            .exec();

        if (!existentDoc) {
            // post not found
            throw {status: 400};
        }

        // check permissions
        if (!PostService.permissionsForUser(existentDoc, options.user).allowUpdate) {
            throw {status: 401};
        }

        // update attachments
        let removeAttachmentsResult;
        if (Array.isArray(existentDoc.attachments)) {
            const fileIdsToRemove = existentDoc.attachments.filter(existentFileId => {
                return !postUpdateRequest.attachments.includes(existentFileId);
            });
            if (fileIdsToRemove.length) {
                removeAttachmentsResult = await this.fileService.remove({id: fileIdsToRemove}, options);
            }
        }

        const postData: Partial<IPostAllDetails> = {
            updateDate: new Date(),
            contentType: postUpdateRequest.contentType,
            title: postUpdateRequest.title,
            brief: postUpdateRequest.brief,
            content: postUpdateRequest.content,
            tags: postUpdateRequest.tags || [],
            titleImg: postUpdateRequest.titleImg || null,
            attachments: postUpdateRequest.attachments || [],
            hru: postUpdateRequest.hru,
            allowRead: postUpdateRequest.allowRead,
        };

        const updatedDoc: IPostAllDetailsPopulatedDocument = await this.PostModel
            .findOneAndUpdate({_id: postUpdateRequest._id}, postData, {
                'new': true,
                upsert: false,
                runValidators: true
            })
            .lean(true)
            .populate('attachments titleImg')
            .exec();

        return PostService.postAllDetails2Plain(updatedDoc);
    }

    async updateStatus(postUpdateStatusRequest: IPostUpdateStatusRequest, options: IWithUserContext): Promise<boolean> {
        options.user.assertAuth([{role: ['admin']}]);

        const ids = Array.isArray(postUpdateStatusRequest.id) ? postUpdateStatusRequest.id : [postUpdateStatusRequest.id];
        const res = await this.PostModel
            .find({_id: {$in: ids}})
            .cursor()
            .eachAsync(doc => {
                if (PostService.permissionsForUser({
                    allowRead: doc.allowRead,
                    status: doc.status,
                    author: doc.author
                }, options.user).allowUpdate && doc.status !== postUpdateStatusRequest.status) {
                    doc.status = postUpdateStatusRequest.status;
                    doc.pubDate = postUpdateStatusRequest.status === 'PUB' ? new Date() : null;
                    return doc.save();
                }
                return false;
            });
        // TODO check res type
        return true;
    }

    async getTags(tagRequest: ITagListRequest, options: IWithUserContext): Promise<ITagInfo[]> {

        if (tagRequest.status.includes('DRAFT') && !options.user.authenticated) {
            // tags of draft posts only for not anonym users
            throw {status: 401};
        }

        return this.aggregateCacheService.applyCaching({
            key: 'TAGS',
            ttl: 3600000,
            aggregateFn: this.getAggregatedTagsInternal,
            thisArg: this,
        })(tagRequest, options);
    }

}
