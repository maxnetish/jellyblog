import resources from 'jb-resources';
import cloneDeep from "lodash/cloneDeep";
import isEqual from "lodash/isEqual";
import uploadFile from '../../../utils/upload-file';
import routesMap from '../../../../config/routes-map.json';

// initial state
function state() {
    return {
        robotsTxt: {
            content: null
        },
        robotsTxtOriginal: {
            content: null
        },
        robotsTxtLoading: false,

        uploading: false,
        restoreResults: [],

        errorState: null
    };
}

const mutationTypes = {
    'ERROR': 'ERROR',
    'FETCHED_ROBOTS_TXT': 'FETCHED_ROBOTS_TXT',
    'ROBOTS_LOADING_STATE_CHANGED': 'ROBOTS_LOADING_STATE_CHANGED',
    'ROBOTS_CONTENT_CHANGED': 'ROBOTS_CONTENT_CHANGED',
    'UPLOAD_STATE_CHANGED': 'UPLOAD_STATE_CHANGED',
    'RESTORE_RESULTS_ADDED': 'RESTORE_RESULTS_ADDED'
};

const getters = {
    robotsTxtDirty(state) {
        return !isEqual(state.robotsTxt, state.robotsTxtOriginal);
    }
};

const actions = {
    fetchPageData({commit, state, dispatch}, {route}) {
        return Promise.all([
            dispatch('fetchRobotsTxt')
        ]);
    },
    fetchRobotsTxt({commit}) {
        commit(mutationTypes.ROBOTS_LOADING_STATE_CHANGED, true);
        return resources.option.robotsGet()
            .then(result => {
                commit(mutationTypes.ROBOTS_LOADING_STATE_CHANGED, false);
                commit(mutationTypes.ERROR, null);
                commit(mutationTypes.FETCHED_ROBOTS_TXT, result);
            })
            .then(null, err => {
                commit(mutationTypes.ROBOTS_LOADING_STATE_CHANGED, false);
                commit(mutationTypes.ERROR, err);
            });
    },
    uploadDumpFileToRestore({commit}, {file}) {
        commit(mutationTypes.UPLOAD_STATE_CHANGED, true);
        return uploadFile({
            file,
            context: 'dump',
            metadata: {},
            url: routesMap.dbRestore
        })
            .then(restoreResponse => {
                commit(mutationTypes.ERROR, null);
                commit(mutationTypes.UPLOAD_STATE_CHANGED, false);
                commit(mutationTypes.RESTORE_RESULTS_ADDED, restoreResponse);
            })
            .then(null, err => {
                commit(mutationTypes.UPLOAD_STATE_CHANGED, false);
                commit(mutationTypes.ERROR, err);
            });
    },
    robotsTxtSubmit({commit, state}) {
        let content = state.robotsTxt.content;
        commit(mutationTypes.ROBOTS_LOADING_STATE_CHANGED, true);
        return resources.option.robotsSet({content})
            .then(response => {
                commit(mutationTypes.ERROR, null);
                commit(mutationTypes.ROBOTS_LOADING_STATE_CHANGED, false);
                commit(mutationTypes.FETCHED_ROBOTS_TXT, content)
            })
            .then(null, err => {
                commit(mutationTypes.ERROR, err);
                commit(mutationTypes.ROBOTS_LOADING_STATE_CHANGED, false);
            });
    }
};

const mutations = {
    [mutationTypes.ERROR](state, err) {
        state.errorState = err;
    },
    [mutationTypes.FETCHED_ROBOTS_TXT](state, {content}) {
        state.robotsTxt.content = cloneDeep(content);
        state.robotsTxtOriginal = cloneDeep(state.robotsTxt);
    },
    [mutationTypes.UPLOAD_STATE_CHANGED](state, uploadState = false) {
        state.uploading = uploadState;
    },
    [mutationTypes.RESTORE_RESULTS_ADDED](state, restoreResult = '-EMPTY-') {
        state.restoreResults.unshift(restoreResult);
    },
    [mutationTypes.ROBOTS_LOADING_STATE_CHANGED](state, loadingState = false) {
        state.robotsTxtLoading = loadingState;
    },
    [mutationTypes.ROBOTS_CONTENT_CHANGED](state, {value} = {}) {
        state.robotsTxt.content = value;
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