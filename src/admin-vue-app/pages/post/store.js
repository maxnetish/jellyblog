import resources from 'jb-resources';
import cloneDeep from "lodash/cloneDeep";

const allowReadOptions = ['FOR_ALL', 'FOR_REGISTERED', 'FOR_ME'];

// initial state
function state() {
    return {
        post: {},
        postOriginal: {},

        titleImagesFetchBegin: false,
        titleImagesLoading: false,
        titleImagesFromServer: [],
        titleImagesJustAdded: [],
        titleImageSelectOpen: false,


        contentMode: 'EDIT',
        tagsFromServer: [],
        tagsJustAdded: [],
        tagsIsLoading: false,
        tagSelectOpen: false,
        statusUpdating: false,
        // routesMap: routesMap,
        allowReadOptions: allowReadOptions
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
};

const getters = {
    availableTitleImages(state) {
        return state.titleImagesJustAdded.concat(state.titleImagesFromServer);
    }
};

const actions = {
    fetchPageData({commit}, {route}) {
        // if id not setted, server returns model for new post
        return resources.post
            .get({id: route.query.id})
            .then(result => {
                commit(mutationTypes.FETCHED_PAGE_DATA, result);

                this.post = result || {};
                this.postOriginal = cloneDeep(this.post);
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

        /*
        this.titleImagesLoading = true;
        this.titleImageSelectOpen = true;
        this.promiseForTitleImages
            .then(response => {
                self.titleImagesFromServer = response.items || [];
                this.titleImagesLoading = false;
            });
        */
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