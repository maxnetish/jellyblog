import pubAppSettings from '../../../../../config/pub-settings.json';

/// initial state
function state() {
    return {
        posts: [],
        page: 1,
        hasMore: false,
        errState: null
    };
}

const mutationTypes = {
    'ERROR': 'ERROR',
    'FETCHED_PAGE_DATA': 'FETCHED_PAGE_DATA'
};

const getters = {
    user(state, getters, rootState) {
        return rootState.user;
    }
};

const actions = {
    async fetchPageData({commit}, {route, resources}) {
        try {
            const foundPosts = await resources.post.pubList({
                page: route.query.page,
                postsPerPage: pubAppSettings.postsPerPage || 5,
                q: route.query.q
            });
            commit(mutationTypes.ERROR, null);
            commit(mutationTypes.FETCHED_PAGE_DATA, foundPosts);
            return foundPosts;
        }
        catch (err) {
            commit(mutationTypes.ERROR, err);
            return false;
        }

        // return resources.post.pubList({
        //     page: route.query.page,
        //     postsPerPage: pubAppSettings.postsPerPage || 5,
        //     q: route.query.q
        // })
        //     .then(findPosts => {
        //         commit(mutationTypes.ERROR, null);
        //         commit(mutationTypes.FETCHED_PAGE_DATA, findPosts);
        //         return findPosts;
        //     })
        //     .then(null, err => {
        //         commit(mutationTypes.ERROR, err);
        //         return false;
        //     });
    }
};

const mutations = {
    [mutationTypes.ERROR](state, err) {
        state.errState = err;
    },
    [mutationTypes.FETCHED_PAGE_DATA](state, {items = [], page = 1, hasMore = false}) {
        state.posts = items;
        state.page = page;
        state.hasMore = hasMore;
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