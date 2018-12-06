import resources from 'jb-resources';
import cloneDeep from "lodash/cloneDeep";
import isEqual from "lodash/isEqual";

const allowReadOptions = ['FOR_ALL', 'FOR_REGISTERED', 'FOR_ME'];
const contentTypeOptions = ['MD', 'HTML'];

// initial state
function state() {
    return {
        // Post model
        post: {},
        postOriginal: {},

        // state of title images dropdaown
        titleImagesFetchBegin: false,
        titleImagesLoading: false,
        titleImagesFromServer: [],
        titleImagesJustAdded: [],
        titleImageSelectOpen: false,

        // state of tags multiselect dropdown
        tagsFetchBegin: false,
        tagSelectOpen: false,
        tagsFromServer: [],
        tagsJustAdded: [],
        tagsIsLoading: false,

        // option sets for radio switches
        allowReadOptions: allowReadOptions,
        contentTypeOptions: contentTypeOptions,

        // preview/edit of post content
        contentMode: 'EDIT',

        // when saving
        statusUpdating: false,
    };
}

const mutationTypes = {
    'ERROR': 'ERROR',
    'FETCHED_PAGE_DATA': 'FETCHED_PAGE_DATA',
    'POST_ALLOW_READ_OPTION_CHANGED': 'ALLOW_READ_OPTION_CHANGED',
    'POST_HRU_CHANGED': 'HRU_CHANGED',
    'POST_TITLE_CHANGED': 'POST_TITLE_CHANGED',
    'POST_TITLE_IMG_CHANGED': 'POST_TITLE_IMG_CHANGED',
    'TITLE_IMAGES_OPTIONS_BEGIN_FETCH': 'TITLE_IMAGES_OPTIONS_BEGIN_FETCH',
    'TITLE_IMAGES_OPTIONS_FETCHED': 'TITLE_IMAGES_OPTIONS_FETCHED',
    'TITLE_IMAGES_ADDED': 'TITLE_IMAGES_ADDED',
    'TITLE_IMAGES_SELECT_OPEN_CHANGED': 'TITLE_IMAGES_SELECT_OPEN_CHANGED',
    'TITLE_IMAGE_REMOVED_FROM_SERVER': 'TITLE_IMAGE_REMOVED_FROM_SERVER',
    'TAG_SELECT_OPEN_CHANGED': 'TAG_SELECT_OPEN_CHANGED',
    'POST_TAGS_CHANGED': 'POST_TAGS_CHANGED',
    'TAGS_BEGIN_FETCH': 'TAGS_BEGIN_FETCH',
    'TAGS_FETCHED': 'TAGS_FETCHED',
    'TAG_ADDED': 'TAG_ADDED',
    'POST_ATTACHMENT_ADDED': 'POST_ATTACHMENT_ADDED',
    'POST_ATTACHMENT_REMOVED': 'POST_ATTACHMENT_REMOVED',
    'POST_CONTENT_TYPE_CHANGED': 'POST_CONTENT_TYPE_CHANGED',
    'POST_BRIEF_CHANGED': 'POST_BRIEF_CHANGED',
    'CONTENT_MODE_CHANGED': 'CONTENT_MODE_CHANGED',
    'POST_CONTENT_CHANGED': 'POST_CONTENT_CHANGED',
    'STATUS_UPDATING_CHANGED': 'STATUS_UPDATING_CHANGED',
    'POST_STATUS_UPDATED': 'POST_STATUS_UPDATED'
};

const getters = {
    availableTitleImages(state) {
        return state.titleImagesJustAdded.concat(state.titleImagesFromServer);
    },
    availableTags(state) {
        return state.tagsJustAdded.concat(state.tagsFromServer);
    },
    dirty(state) {
        return !isEqual(state.post, state.postOriginal);
    }
};

const actions = {
    fetchPageData({commit}, {route}) {
        // if id not setted, server returns model for new post
        return resources.post
            .get({id: route.query.id})
            .then(result => {
                commit(mutationTypes.FETCHED_PAGE_DATA, result);
            });
    },
    needTitleImages({commit, state}) {
        if (state.titleImagesFetchBegin) {
            return Promise.resolve(true);
        }

        commit(mutationTypes.TITLE_IMAGES_OPTIONS_BEGIN_FETCH);

        return resources.file
            .find({context: 'avatarImage', max: 1000})
            .then(response => {
                commit(mutationTypes.TITLE_IMAGES_OPTIONS_FETCHED, response);
                return response;
            })
            .then(null, err => {
                commit(mutationTypes.ERROR, err);
            });
    },
    removeTitleImageFromServer({commit, state}, {fileInfo}) {
        return resources.file
            .remove({id: fileInfo._id})
            .then(response => {
                // remove local copy
                ['titleImagesFromServer', 'titleImagesJustAdded'].forEach(key => {
                    let indexToRemove = state[key].findIndex(fi => fi._id === fileInfo._id);
                    if (indexToRemove > -1) {
                        commit(mutationTypes.TITLE_IMAGE_REMOVED_FROM_SERVER, {key, indexToRemove});
                    }
                });
                if (state.post.titleImg && state.post.titleImg._id === fileInfo._id) {
                    commit(mutationTypes.POST_TITLE_IMG_CHANGED);
                }
                return response;
            })
            .then(null, err => {
                commit(mutationTypes.ERROR, err);
            });
    },
    needTags({commit, state}) {
        if (state.tagsFetchBegin) {
            return Promise.resolve(true);
        }

        commit(mutationTypes.TAGS_BEGIN_FETCH);

        return resources.tag
            .list({statuses: ['PUB', 'DRAFT']})
            .then(tagsWithCount => {
                commit(mutationTypes.TAGS_FETCHED, {tags: tagsWithCount.map(o => o.tag)});
                return tagsWithCount;
            })
            .then(null, err => {
                commit(mutationTypes.ERROR, err);
            });
    },
    togglePostStatus({commit, state}) {
        let update;
        let currentStatus = state.post.status;
        switch (currentStatus) {
            case 'PUB':
                update = resources.post.unpublish;
                break;
            case 'DRAFT':
                update = resources.post.publish;
                break;
            default:
                update = resources.post.unpublish;
        }
        commit(mutationTypes.STATUS_UPDATING_CHANGED, {updating: true});
        return update({id: state.post._id})
            .then(response => {
                let newStatus;
                switch (currentStatus) {
                    case 'PUB':
                        newStatus = 'DRAFT';
                        break;
                    case 'DRAFT':
                    default:
                        newStatus = 'PUB';
                        break;
                }
                commit(mutationTypes.STATUS_UPDATING_CHANGED, {updating: false});
                commit(mutationTypes.POST_STATUS_UPDATED, {status: newStatus, alsoUpdateOriginalPost: true});
            })
            .then(null, err => {
                commit(mutationTypes.STATUS_UPDATING_CHANGED, {updating: false});
                commit(mutationTypes.ERROR, err);
            });
    },
    submit({commit, state}) {
        commit(mutationTypes.STATUS_UPDATING_CHANGED, {updating: true});
        resources.post
            .createOrUpdate(state.post)
            .then(response => {
                commit(mutationTypes.STATUS_UPDATING_CHANGED, {updating: false});
                commit(mutationTypes.FETCHED_PAGE_DATA, response);
            })
            .then(null, err => {
                commit(mutationTypes.STATUS_UPDATING_CHANGED, {updating: false});
                commit(mutationTypes.ERROR, err);
            });
    }
};

const mutations = {
    [mutationTypes.ERROR](state, err) {
        state.errorState = err;
    },
    [mutationTypes.FETCHED_PAGE_DATA](state, postData) {
        state.post = cloneDeep(postData);
        state.postOriginal = cloneDeep(postData);
    },
    [mutationTypes.POST_ALLOW_READ_OPTION_CHANGED](state, {value, checked}) {
        state.post.allowRead = checked
            ? value
            : state.post.allowRead;
    },
    [mutationTypes.POST_HRU_CHANGED](state, {value = null} = {}) {
        state.post.hru = value;
    },
    [mutationTypes.POST_TITLE_CHANGED](state, {value = null} = {}) {
        state.post.title = value;
    },
    [mutationTypes.POST_TITLE_IMG_CHANGED](state, {fileInfo = null} = {}) {
        state.post.titleImg = fileInfo;
    },
    [mutationTypes.TITLE_IMAGES_OPTIONS_BEGIN_FETCH](state) {
        state.titleImagesFetchBegin = true;
        state.titleImagesLoading = true;
    },
    [mutationTypes.TITLE_IMAGES_OPTIONS_FETCHED](state, {items = []} = {}) {
        state.titleImagesFromServer = cloneDeep(items);
        state.titleImagesLoading = false;
    },
    [mutationTypes.TITLE_IMAGES_ADDED](state, {fileInfo}) {
        state.titleImagesJustAdded.unshift(fileInfo);
        state.post.titleImg = fileInfo;
    },
    [mutationTypes.TITLE_IMAGES_SELECT_OPEN_CHANGED](state, {open = false} = {}) {
        state.titleImageSelectOpen = open;
    },
    [mutationTypes.TITLE_IMAGE_REMOVED_FROM_SERVER](state, {key, indexToRemove}) {
        state[key].splice(indexToRemove, 1);
    },
    [mutationTypes.TAG_SELECT_OPEN_CHANGED](state, {open = false} = {}) {
        state.tagSelectOpen = open;
    },
    [mutationTypes.POST_TAGS_CHANGED](state, {tags = []} = {}) {
        state.post.tags = tags;
    },
    [mutationTypes.TAGS_BEGIN_FETCH](state) {
        state.tagsFetchBegin = true;
        state.tagsIsLoading = true;
    },
    [mutationTypes.TAGS_FETCHED](state, {tags = []} = {}) {
        state.tagsFromServer = cloneDeep(tags);
        state.tagsIsLoading = false;
    },
    [mutationTypes.TAG_ADDED](state, {tag}) {
        state.tagsJustAdded.unshift(tag);
        state.post.tags.push(tag);
    },
    [mutationTypes.POST_ATTACHMENT_ADDED](state, {attachmentInfo}) {
        state.post.attachments = state.post.attachments || [];
        state.post.attachments.unshift(attachmentInfo);
    },
    [mutationTypes.POST_ATTACHMENT_REMOVED](state, {attachmentIndex}) {
        state.post.attachments.splice(attachmentIndex, 1);
    },
    [mutationTypes.POST_CONTENT_TYPE_CHANGED](state, {value, checked}) {
        state.post.contentType = checked
            ? value
            : state.post.contentType;
    },
    [mutationTypes.POST_BRIEF_CHANGED](state, {value = ''} = {}) {
        state.post.brief = value;
    },
    [mutationTypes.CONTENT_MODE_CHANGED](state, {value, checked}) {
        state.contentMode = checked
            ? value
            : state.contentMode;
    },
    [mutationTypes.POST_CONTENT_CHANGED](state, {value = ''} = {}) {
        state.post.content = value;
    },
    [mutationTypes.STATUS_UPDATING_CHANGED](state, {updating = false} = {}) {
        state.statusUpdating = updating;
    },
    [mutationTypes.POST_STATUS_UPDATED](state, {status, alsoUpdateOriginalPost}) {
        state.post.status = status;
        if (alsoUpdateOriginalPost) {
            state.postOriginal.status = status;
        }
    }
};

const store = {
    namespaced: true,
    state,
    getters,
    actions,
    mutations
};

export {
    store,
    mutationTypes
};