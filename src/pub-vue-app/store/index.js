import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

function createStore() {
    return new Vuex.Store({
        state: function () {
            return {
                exampleAsyncText: ''
            };
        },
        actions: {
            fetchData({commit}) {
                // возвращаем Promise через `store.dispatch()`
                // чтобы мы могли понять когда данные будут загружены
                const promise = new Promise((resolve, reject) => {
                    setTimeout(function () {
                        resolve('Async data');
                    }, 1000);
                });

                return promise
                    .then(response => {
                        commit('setAsyncData', response);
                    });
            }
        },
        mutations: {
            setAsyncData(state, asyncData) {
                state.exampleAsyncText = asyncData;
            }
        }
    })
}

export {
    createStore
};