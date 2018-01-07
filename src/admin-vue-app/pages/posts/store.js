import resources from 'jb-resources';
import isArray from 'lodash/isArray';
import toInteger from "lodash/toInteger";

// initial state
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
    'CHECK_POST_CHANGED': 'CHECK_POST_CHANGED',
    'POST_CHANGED': 'POST_CHANGED'
};

// getters
// (Computed props of store)
const getters = {
    someChecked: state => {
        return state.items.some(p => p.checked);
    }
    /*
    cartProducts: (state, getters, rootState) => {
        return state.added.map(({ id, quantity }) => {
            const product = rootState.products.all.find(product => product.id === id)
            return {
                title: product.title,
                price: product.price,
                quantity
            }
        })
    }
    */
};

// actions
// (Async operations to initiate sunc mutations)
const actions = {
    fetchPageData({commit}, {route = null, request = null} = {}) {
        request = request
            ? request
            : {
                page: toInteger(route.query.p) || 1,
                statuses: ['PUB', 'DRAFT'],
                q: route.query.q,
                from: route.query.from,
                to: route.query.to
            };

        // We going to return promise
        // See https://ssr.vuejs.org/ru/data.html
        return resources.post
            .list(request)
            .then(result => {
                // We should add 'checked' to make prop reactive else vue will not detect changes of 'checked'
                result.items = isArray(result.items)
                    ? result.items.map(p => ({
                        ...p,
                        checked: false,
                        statusUpdating: false
                    }))
                    : result.items;
                commit(mutationTypes.FETCHED_PAGE_DATA, result);
                commit(mutationTypes.ERROR, null);
                return result;
            })
            .then(null, err => {
                commit(mutationTypes.ERROR, err);
            });
    },
    makeDraftCheckedPosts({commit, state}) {
        let posts = state.items.filter(p => p.checked);
        posts.forEach(p => {
            commit(mutationTypes.POST_CHANGED, {
                id: p._id,
                changes: {
                    statusUpdating: true
                }
            });
        });
        return resources.post
            .unpublish({
                ids: posts.map(p => p._id)
            })
            .then(response => {
                posts.forEach(post => {
                    commit(mutationTypes.POST_CHANGED, {
                        id: post._id,
                        changes: {
                            statusUpdating: false,
                            status: 'DRAFT'
                        }
                    });
                });
                commit(mutationTypes.ERROR, null);
                return response;
            })
            .then(null, err => {
                posts.forEach(post => {
                    commit(mutationTypes.POST_CHANGED, {
                        id: post._id,
                        changes: {
                            statusUpdating: false
                        }
                    });
                });
                commit(mutationTypes.ERROR, err);
            });
    },
    publishCheckedPosts({commit, state}) {
        let posts = state.items.filter(p => p.checked);

        posts.forEach(p => {
            commit(mutationTypes.POST_CHANGED, {
                id: p._id,
                changes: {
                    statusUpdating: true
                }
            });
        });

        return resources.post
            .publish({
                ids: posts.map(p => p._id)
            })
            .then(response => {
                posts.forEach(post => {
                    commit(mutationTypes.POST_CHANGED, {
                        id: post._id,
                        changes: {
                            statusUpdating: false,
                            status: 'PUB'
                        }
                    });
                });
                commit(mutationTypes.ERROR, null);
                return response;
            })
            .then(null, err => {
                posts.forEach(post => {
                    commit(mutationTypes.POST_CHANGED, {
                        id: post._id,
                        changes: {
                            statusUpdating: false
                        }
                    });
                });
                commit(mutationTypes.ERROR, err);
            });
    },
    makeDraftOnePost({commit}, {_id}) {
        commit(mutationTypes.POST_CHANGED, {
            id: _id,
            changes: {
                statusUpdating: true
            }
        });
        return resources.post
            .unpublish({
                id: _id
            })
            .then(response => {
                commit(mutationTypes.POST_CHANGED, {
                    id: _id,
                    changes: {
                        statusUpdating: false,
                        status: 'DRAFT'
                    }
                });
                commit(mutationTypes.ERROR, null);
                return response;
            })
            .then(null, err => {
                commit(mutationTypes.POST_CHANGED, {
                    id: _id,
                    changes: {
                        statusUpdating: false
                    }
                });
                commit(mutationTypes.ERROR, err);
            });
    },
    publishOnePost({commit}, {_id}) {
        commit(mutationTypes.POST_CHANGED, {
            id: _id,
            changes: {
                statusUpdating: true
            }
        });

        return resources.post
            .publish({
                id: _id
            })
            .then(response => {
                commit(mutationTypes.POST_CHANGED, {
                    id: _id,
                    changes: {
                        statusUpdating: false,
                        status: 'PUB'
                    }
                });
                commit(mutationTypes.ERROR, null);
                return response;
            })
            .then(null, err => {
                commit(mutationTypes.POST_CHANGED, {
                    id: _id,
                    changes: {
                        statusUpdating: false
                    }
                });
                commit(mutationTypes.ERROR, err);
            });
    },
    removeCheckedPosts({state, dispatch, commit}, {route = null, request = null} = {}) {
        let posts = state.items.filter(p => p.checked);
        return resources.post
            .remove({ids: posts.map(p => p._id)})
            .then(response => dispatch('fetchPageData', {route, request}))
            .then(null, err => commit(mutationTypes.ERROR, err));
    },
    removeOnePost({dispatch, commit}, {route = null, request = null, _id} = {}) {
        return resources.post
            .remove({id: _id})
            .then(response => dispatch('fetchPageData', {route, request}))
            .then(null, err => commit(mutationTypes.ERROR, err));
    }
    /*
    checkout ({ commit, state }, products) {
        const savedCartItems = [...state.added]
        commit(types.SET_CHECKOUT_STATUS, null)
        // empty cart
        commit(types.SET_CART_ITEMS, { items: [] })
        shop.buyProducts(
            products,
            () => commit(types.SET_CHECKOUT_STATUS, 'successful'),
            () => {
                commit(types.SET_CHECKOUT_STATUS, 'failed')
                // rollback to the cart saved before sending the request
                commit(types.SET_CART_ITEMS, { items: savedCartItems })
            }
        )
    }
    */
};

// mutations
// (To change state)
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
    [mutationTypes.CHECK_POST_CHANGED](state, {index, checked = false} = {}) {
        state.items[index].checked = checked;
    },
    [mutationTypes.POST_CHANGED](state, {id = null, changes = {}} = {}) {
        let ind = state.items.findIndex(p => p._id === id);
        if (ind > -1) {
            for (let prop in changes) {
                state.items[ind][prop] = changes[prop];
            }
        }
    }
    /*
    [types.ADD_TO_CART] (state, { id }) {
        state.checkoutStatus = null
        const record = state.added.find(product => product.id === id)
        if (!record) {
            state.added.push({
                id,
                quantity: 1
            })
        } else {
            record.quantity++
        }
    }
    */
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
