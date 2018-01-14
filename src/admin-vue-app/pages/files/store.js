import resources from 'jb-resources';
import toInteger from "lodash/toInteger";
import isArray from "lodash/isArray";

/// initial state
function state() {
    return {
        items: [],
        hasMore: false,
        checkAll: false,
        errorState: null
    };
}

const mutationTypes = {
    'ERROR': 'ERROR',
    'FETCHED_PAGE_DATA': 'FETCHED_PAGE_DATA',
    'CHECK_ALL_CHANGED': 'CHECK_ALL_CHANGED',
    'CHECK_FILE_CHANGED': 'CHECK_FILE_CHANGED'
};

const getters = {
    someChecked: state => {
        return state.items.some(p => p.checked);
    }
};

const actions = {
    fetchPageData({commit}, {route = null, request = null} = {}) {
        request = request
            ? request
            : {
                page: toInteger(route.query.p) || 1,
                context: route.query.c,
                contentType: route.query.t,
                dateTo: route.query.to,
                dateFrom: route.query.from,
                withoutPostId: true
            };

        return resources.file
            .find(request)
            .then(result => {
                result.items = isArray(result.items)
                    ? result.items.map(p => ({
                        ...p,
                        checked: false
                    }))
                    : result.items;
                commit(mutationTypes.FETCHED_PAGE_DATA, result);
                commit(mutationTypes.ERROR, null);
            })
            .then(null, err => {
                commit(mutationTypes.ERROR, err);
            });
    },
    removeCheckedFiles({state, dispatch, commit}, {route}) {
        let checkedIds = state.items
            .filter(f => f.checked)
            .map(f => f.id);
        if (!checkedIds.length) {
            return Promise.resolve(false);
        }
        return resources.file
            .remove({id: checkedIds})
            .then(res => {
                return dispatch('fetchPageData', {route})
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
        state.checkAll = false;
    },
    [mutationTypes.CHECK_ALL_CHANGED](state, {checked = false} = {}) {
        state.checkAll = checked;
        state.items.forEach(p => {
            p.checked = checked;
        });
    },
    [mutationTypes.CHECK_FILE_CHANGED](state, {index, checked}) {
        state.items[index].checked = checked;
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