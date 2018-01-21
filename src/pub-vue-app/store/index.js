import Vuex from 'vuex';

import createTagsCloudModel from '../../utils/create-tags-cloude-model';

const mutationTypes = {
    'ERROR': 'ERROR',
    'PAGE_DATA_FETCHED': 'PAGE_DATA_FETCHED',
    'FETCHED_TAGS': 'FETCHED_TAGS',
    'FETCHED_USER': 'FETCHED_USER'
};

function state() {
    return {
        pageDataFetched: false,
        tags: [],
        user: null,
        errState: null
    };
}

const actions = {
    fetchPageData({commit}, {route, resources}) {
        return Promise.all([
            resources.tag.list(),
            resources.user.get()
        ])
            .then(responses => {
                const tagsModel = createTagsCloudModel(responses[0]);
                const userModel = responses[1];
                commit(mutationTypes.PAGE_DATA_FETCHED);
                commit(mutationTypes.FETCHED_TAGS, tagsModel);
                commit(mutationTypes.FETCHED_USER, userModel);
            })
            .then(null, err => {
                commit(mutationTypes.PAGE_DATA_FETCHED);
                commit(mutationTypes.ERROR, err);
            });
    }
};

const mutations = {
    [mutationTypes.ERROR](state, err) {
        state.errState = err;
    },
    [mutationTypes.PAGE_DATA_FETCHED](state) {
        state.pageDataFetched = true;
    },
    [mutationTypes.FETCHED_TAGS](state, tags) {
        state.tags = tags;
    },
    [mutationTypes.FETCHED_USER](state, user) {
        state.user = user;
    }
};

function createStore({Vue}) {
    Vue.use(Vuex);

    return new Vuex.Store({
        state,
        actions,
        mutations,
        strict: process.env.NODE_ENV !== 'production'
    })
}

export {
    createStore,
    mutationTypes
};