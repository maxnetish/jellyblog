import {Post, Tag, File, FileData} from '../../models';
import {applyCheckPermissions} from '../../utils-data';


const request2PostModel = {
    CREATE ({postFromRequest = {}, user = {}} = {}) {
        return {
            author: user.userName,
            contentType: postFromRequest.contentType,
            title: postFromRequest.title,
            brief: postFromRequest.brief,
            content: postFromRequest.content,
            tags: postFromRequest.tags,
            // titleImg: postFromRequest.titleImg,
            // attachments: postFromRequest.attachments
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
            // titleImg: postFromRequest.titleImg,
            // attachments: postFromRequest.attachments
        };
    }
};

const dbOperation = {
    CREATE ({postData = {}} = {}) {
        return Post.create(postData);
    },
    UPDATE ({postData = {}, _id} = {}) {
        return Post
            .findByIdAndUpdate(_id, postData, {
                'new': true,
                upsert: false,
                lean: false
            })
            .exec();
    }
};

function createOrUpdatePost(post) {
    let requestMode = post._id ? 'UPDATE' : 'CREATE';
    let postData = request2PostModel[requestMode]({postFromRequest: post, user: this.req.user});

    return dbOperation[requestMode]({postData, _id: post._id})
        .then(createdOrUpdatedPost => {
            return Post.populate(createdOrUpdatedPost, {path: 'attachments titleImg'});
        });

}

export default applyCheckPermissions({
    rpcCall: true,
    roles: ['admin'],
    resourceFn: createOrUpdatePost
});