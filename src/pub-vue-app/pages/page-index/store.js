import pubAppSettings from '../../../../config/pub-settings.json';
import createPaginationModel from "../../../utils/create-pagination-model";


/// initial state
function state() {
    return {
        posts: [],
        pagination: {},
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
        return resources.post.pubList({
            page: route.query.page,
            postsPerPage: pubAppSettings.postsPerPage || 5,
            q: route.query.q
        })
            .then(findPosts => {
                let pagination = createPaginationModel({
                    currentUrl: route.url,
                    currentPage: findPosts.page,
                    hasMore: findPosts.hasMore
                });
                let posts = findPosts.items;
                commit(mutationTypes.ERROR, null);
                commit(mutationTypes.FETCHED_PAGE_DATA, {posts, pagination});
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
    [mutationTypes.FETCHED_PAGE_DATA](state, {posts = [], pagination = {}} = {}) {
        state.posts = posts;
        state.pagination = pagination;
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