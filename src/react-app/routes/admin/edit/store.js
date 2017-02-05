import StateStoreBase from '../../../../state-utils/state-store-base';
import Actions from '../../../../state-utils/actions';
import resources from '../../../../resources';

const actions = new Actions({
    descriptor: {
        'componentMounted': {
            async: true
        },
        postFieldChanged: {
            async: false
        },
        saveButtonClick: {
            async: false
        }
    }
});

class AdminPostStore extends StateStoreBase {
    constructor(initialState) {
        super({actions, initialState});
    }

    onComponentMounted(props) {
        let self = this;

        self.assignState({
            loadingTags: true
        });
        self.notifyStateChanged();

        // DEBUG
        // resources.file.find({
        //     context: 'avatarImage',
        // })
        //     .then(res => {
        //         console.log(res);
        //     })
        //     .catch(err => console.warn(err));

        resources.post.get({id: props.params.postId})
            .then(res => {
                self.assignState({
                    post: res
                });
                self.notifyStateChanged();
            })
            .catch(err => {
                self.assignState({
                    err: err,
                    post: {}
                });
                self.notifyStateChanged();
            });
        resources.tag.list()
            .then(tagResponse => {
                let tags = tagResponse.items;
                self.assignState({
                    tags: tags,
                    loadingTags: false
                });
                self.notifyStateChanged();
            })
            .catch(err => {
                self.assignState({
                    err: err,
                    tags: [],
                    loadingTags: false
                });
                self.notifyStateChanged();
            });
    }

    onPostFieldChanged(val) {
        this.assignState({
            post: Object.assign(this.getState().post, val)
        });
        this.notifyStateChanged();
    }

    onSaveButtonClick(post) {
        // validate ?
        let self = this;
        if (post && post.tags) {
            post.tags = post.tags.map(tagWrapped => tagWrapped.value);
        }
        if (post.attachments) {
            post.attachments = post.attachments.map(a => a._id);
        }
        if (post.titleImg) {
            post.titleImg = post.titleImg._id;
        }
        resources.post
            .update(post)
            .then(res => {
                self.assignState({
                    post: res,
                    loadingTags: true
                });
                return resources.tag.list();
            })
            .then(res => {
                // we should update tags, else tags could contain tag(s) without correct _id
                let tags= res.items;
                self.assignState({
                    tags: tags,
                    loadingTags: false
                });
                self.notifyStateChanged();
                return res;
            })
            .catch(err => {
                self.assignState({
                    err: err,
                    loadingTags: false
                });
                self.notifyStateChanged();
            });

    }
}

export {
    AdminPostStore,
    actions
};