
/// initial state
function state() {
    return {
        post: null,
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
    fetchPageData({commit}, {route, resources}) {
        return resources.post.pubGet({
            id: route.params.postId
        })
            .then(post => {
                commit(mutationTypes.ERROR, null);
                commit(mutationTypes.FETCHED_PAGE_DATA, {post});
                return post;
            })
            .then(null, err => {
                commit(mutationTypes.ERROR, err);
                return err;
            })
            ;
    }
};

const mutations = {
    [mutationTypes.ERROR](state, err) {
        // Here throws
        // Unhandled promise rejection InternalError: too much recursion in es6-promise polifill Firefox
        state.errState = err;
    },
    [mutationTypes.FETCHED_PAGE_DATA](state, {post = null} = {}) {
        state.post = post;
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