import {Post} from '../../models';
import {applyCheckPermissions, updatePostAttachments, canUpdatePost} from '../../utils-data';

const request2PostModel = {
    CREATE({postFromRequest = {}, user = {}} = {}) {
        return {
            author: user.userName,
            contentType: postFromRequest.contentType,
            title: postFromRequest.title,
            brief: postFromRequest.brief,
            content: postFromRequest.content,
            tags: postFromRequest.tags,
            titleImg: postFromRequest.titleImg ? postFromRequest.titleImg.id : null,
            attachments: postFromRequest.attachments ? postFromRequest.attachments.map(a => a.id) : [],
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
            titleImg: postFromRequest.titleImg ? postFromRequest.titleImg.id : null,
            attachments: postFromRequest.attachments ? postFromRequest.attachments.map(a => a.id) : [],
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
                        lean: false,
                        runValidators: true
                    })
                    .exec();
            });
    }
};

function createOrUpdatePost(post) {
    let requestMode = post._id ? 'UPDATE' : 'CREATE';

    // check permission, can user update?
    // can create - checks in 'applyCheckPermissions', requires 'admin' role
    return Promise.resolve(requestMode === 'CREATE' ? true : canUpdatePost({post, user: this.user}))
        .then(canUpdateOrCreate => {
            if(!canUpdateOrCreate) {
                // cannot update
                return Promise.reject({status: 401});
            }
            let postData = request2PostModel[requestMode]({postFromRequest: post, user: this.user});
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
