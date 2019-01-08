import {resourcesFactory} from 'jb-resources';

const resources = resourcesFactory();

/// initial state
function state() {
    return {
        items: [],
        hasMore: false,
        errorState: null
    };
}

const mutationTypes = {
    'ERROR': 'ERROR',
    'FETCHED_PAGE_DATA': 'FETCHED_PAGE_DATA'
};

const getters = {

};

const actions = {
    fetchPageData({commit}, {route = null, request = null} = {}) {
        request = request
            ? request
            : {
                page: route.query.p,
                err: route.query.e ? 1 : undefined,
                dateTo: route.query.to,
                dateFrom: route.query.from
            };

        return resources.log
            .get(request)
            .then(result => {
                commit(mutationTypes.FETCHED_PAGE_DATA, result);
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
    [mutationTypes.FETCHED_PAGE_DATA](state, {items = [], hasMore = false} = {}) {
        state.items = items;
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