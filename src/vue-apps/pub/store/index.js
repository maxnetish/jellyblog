import Vuex from 'vuex';

import createTagsCloudModel from '../../../utils/create-tags-cloude-model';

const mutationTypes = {
    'ERROR': 'ERROR',
    'PAGE_DATA_FETCHED': 'PAGE_DATA_FETCHED',
    'FETCHED_TAGS': 'FETCHED_TAGS',
    'FETCHED_USER': 'FETCHED_USER'
};

// 1. We put in state json with locale strings
// 2. And stub - required, else syntax-dynamic-import won't import json
// We should really import only when server rendering.
// Browser receive these resoutces throw __INITIAL_STATE__
function promiseState({language, importStatics}) {
    const stubLanguage = 'ru';
    const promise = importStatics ? Promise.all([
        import (
            /* webpackChunkName: "[request]-stub" */
            /* webpackMode: "lazy" */
            `./stub/${stubLanguage}`
            ),
        import(
            /* webpackChunkName: "[request]-gettext" */
            /* webpackMode: "lazy" */
            `../../../i18n/${language}.json`
            )
    ]) : Promise.resolve({noData: true});

    return promise
        .then(imported => {
            return function state() {
                return {
                    pageDataDirty: true,
                    tags: [],
                    user: null,
                    errState: null,
                    langApp: imported.noData ? null : Object.assign({}, imported[1]),
                    // langDateFns: imported.noData ? null : imported[0],
                    language: language
                };
            };
        });
}

/*
function state() {
    return {
        pageDataDirty: true,
        tags: [],
        user: null,
        errState: null
    };
}


*/

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
                return responses;
            })
            .then(null, err => {
                commit(mutationTypes.PAGE_DATA_FETCHED);
                commit(mutationTypes.ERROR, err);
                return false;
            });
    }
};

const mutations = {
    [mutationTypes.ERROR](state, err) {
        state.errState = err;
    },
    [mutationTypes.PAGE_DATA_FETCHED](state) {
        state.pageDataDirty = false;
    },
    [mutationTypes.FETCHED_TAGS](state, tags) {
        state.tags = tags;
    },
    [mutationTypes.FETCHED_USER](state, user) {
        state.user = user;
    }
};

// TODO передадим {language, importStatics} чтобы не дергать бэк за данными, которые уже будут на клиенте
function createStore({Vue, language, importStatics = false}) {
    Vue.use(Vuex);

    return promiseState({language, importStatics})
        .then(state => {
            return new Vuex.Store({
                state,
                actions,
                mutations,
                strict: process.env.NODE_ENV !== 'production'
            })
        })

    // return new Vuex.Store({
    //     state,
    //     actions,
    //     mutations,
    //     strict: process.env.NODE_ENV !== 'production'
    // })
}

export {
    createStore,
    mutationTypes
};