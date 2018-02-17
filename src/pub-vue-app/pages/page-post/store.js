
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

const getters = {};

const actions = {
    fetchPageData({commit}, {route, resources}) {
        return resources.post.pubGet({
            id: route.params.postId
        })
            .then(post => {
                commit(mutationTypes.ERROR, null);
                commit(mutationTypes.FETCHED_PAGE_DATA, {post});
            })
            .then(null, err => {
                commit(mutationTypes.ERROR, err);
            });
    }
};

const mutations = {
    [mutationTypes.ERROR](state, err) {
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