import {Post} from '../../models';
import {applyCheckPermissions, updatePostAttachments} from '../../utils-data';

const request2PostModel = {
    CREATE({postFromRequest = {}, user = {}} = {}) {
        return {
            author: user.userName,
            contentType: postFromRequest.contentType,
            title: postFromRequest.title,
            brief: postFromRequest.brief,
            content: postFromRequest.content,
            tags: postFromRequest.tags,
            titleImg: postFromRequest.titleImg ? postFromRequest.titleImg._id : null,
            attachments: postFromRequest.attachments ? postFromRequest.attachments.map(a => a._id) : [],
            hru: postFromRequest.hru,
            allowRead: postFromRequest.allowRead
        };
    },
    UPDATE({postFromRequest = {}, user = {}} = {}) {
        return {
            updateDate: new Date(),
            contentType: postFromRequest.contentType,
            title: postFromRequest.title,
            brief: postFromRequest.brief,
            content: postFromRequest.content,
            tags: postFromRequest.tags,
            titleImg: postFromRequest.titleImg ? postFromRequest.titleImg._id : null,
            attachments: postFromRequest.attachments ? postFromRequest.attachments.map(a => a._id) : [],
            hru: postFromRequest.hru,
            allowRead: postFromRequest.allowRead
        };
    }
};

const dbOperation = {
    CREATE({postData = {}} = {}) {
        return Post.create(postData);
    },
    UPDATE({postData = {}, _id} = {}) {
        return updatePostAttachments(_id, postData.attachments)
            .then(() => {
                return Post
                    .findByIdAndUpdate(_id, postData, {
                        'new': true,
                        upsert: false,
                        lean: false
                    })
                    .exec();
            });
    }
};

function canUpdate({post, user}) {
    return Post.findById(post._id, null, {lean: true})
        .exec()
        .then(existentPost => {
            if (!(existentPost && existentPost._id)) {
                // post not found
                return true;
            }
            let permissions = Post.mapPermissions({post: existentPost, user});
            return permissions.allowUpdate;
        });
}

function createOrUpdatePost(post) {
    let requestMode = post._id ? 'UPDATE' : 'CREATE';

    // check permission, can user update?
    // can create - checks in 'applyCheckPermissions', requires 'admin' role
    return Promise.resolve(requestMode === 'CREATE' ? true : canUpdate({post, user: this.req.user}))
        .then(canUpdateOrCreate => {
            if(!canUpdateOrCreate) {
                // cannot update
                return Promise.reject(401);
            }
            let postData = request2PostModel[requestMode]({postFromRequest: post, user: this.req.user});
            return dbOperation[requestMode]({postData, _id: post._id})
        })
        .then(createdOrUpdatedPost => {
            return Post.populate(createdOrUpdatedPost, {path: 'attachments titleImg'});
        });
}

export default applyCheckPermissions({
    rpcCall: true,
    roles: ['admin'],
    resourceFn: createOrUpdatePost
});